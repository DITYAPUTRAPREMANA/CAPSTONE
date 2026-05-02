import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";

persistent actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Approval State
  let userApproval = UserApproval.initState(accessControlState);

  // MODULES

  // User comparison
  module User {
    public func compare(u1 : User, u2 : User) : Order.Order {
      Nat.compare(u1.id, u2.id);
    };

    public func compareByRole(u1 : User, u2 : User) : Order.Order {
      switch (Text.compare(u1.role, u2.role)) {
        case (#equal) { compare(u1, u2) };
        case (order) { order };
      };
    };
  };

  // Loan comparison
  module Loan {
    public func compare(loan1 : Loan, loan2 : Loan) : Order.Order {
      Nat.compare(loan1.id, loan2.id);
    };

    public func compareByBorrower(loan1 : Loan, loan2 : Loan) : Order.Order {
      switch (Nat.compare(loan1.borrowerId, loan2.borrowerId)) {
        case (#equal) { compare(loan1, loan2) };
        case (order) { order };
      };
    };

    public func compareByInvestor(loan1 : Loan, loan2 : Loan) : Order.Order {
      switch (Nat.compare(loan1.investorId, loan2.investorId)) {
        case (#equal) { compare(loan1, loan2) };
        case (order) { order };
      };
    };
  };

  module Payment {
    public func compare(p1 : Payment, p2 : Payment) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };

    public func compareByLoan(p1 : Payment, p2 : Payment) : Order.Order {
      switch (Nat.compare(p1.loanId, p2.loanId)) {
        case (#equal) { compare(p1, p2) };
        case (order) { order };
      };
    };
  };

  // TYPES

  type User = {
    id : Nat;
    principal : Principal;
    name : Text;
    email : Text;
    role : Text;
    ktm : Text;
    bankAccount : Text;
    gpa : Float;
    isVerified : Bool;
  };

  type Loan = {
    id : Nat;
    borrowerId : Nat;
    borrowerName : Text;
    major : Text;
    amount : Nat;
    tenor : Nat;
    monthlyInstallment : Float;
    interestRate : Float;
    purpose : Text;
    status : Text;
    startDate : Time.Time;
    aiScore : Nat;
    investorId : Nat;
  };

  type Payment = {
    id : Nat;
    loanId : Nat;
    amount : Nat;
    paymentDate : Time.Time;
    remainingInstallment : Float;
    status : Text;
    virtualAccount : Text;
  };

  public type ScoringInput = {
    gpa : Float;
    amount : Nat;
    tenor : Nat;
    purpose : Text;
    cleanHistory : Bool;
  };

  public type ScoringResult = {
    score : Nat;
    recommendation : Text;
    reason : Text;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    role : Text;
    ktm : Text;
    bankAccount : Text;
    gpa : Float;
    isVerified : Bool;
  };

  // STATE

  let users = Map.empty<Nat, User>();
  let loans = Map.empty<Nat, Loan>();
  let payments = Map.empty<Nat, Payment>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextUserId = 1;
  var nextLoanId = 1;
  var nextPaymentId = 1;

  // HELPER FUNCTIONS

  func getUserByPrincipal(principal : Principal) : ?User {
    users.values().toArray().find(func(user) { user.principal == principal });
  };

  func isLoanParticipant(caller : Principal, loanId : Nat) : Bool {
    switch (loans.get(loanId)) {
      case (null) { false };
      case (?loan) {
        switch (getUserByPrincipal(caller)) {
          case (null) { false };
          case (?user) {
            user.id == loan.borrowerId or user.id == loan.investorId;
          };
        };
      };
    };
  };

  // User Approval Query
  public query ({ caller }) func isCallerApproved() : async Bool {
    UserApproval.isApproved(userApproval, caller) or AccessControl.hasPermission(accessControlState, caller, #admin);
  };

  public shared ({ caller }) func requestApproval() : async () {
    ignore AccessControl.hasPermission(accessControlState, caller, #guest);
    UserApproval.requestApproval(userApproval, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(userApproval, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(userApproval);
  };

  // USER PROFILE MANAGEMENT (Required by frontend)

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // USER MANAGEMENT

  public shared ({ caller }) func registerUser(name : Text, email : Text, role : Text, ktm : Text, bankAccount : Text, gpa : Float) : async Nat {
    switch (getUserByPrincipal(caller)) {
      case (?existingUser) {
        Runtime.trap(
          "This identity is already registered as " # existingUser.role # ". One identity can only have one role."
        );
      };
      case (null) {};
    };

    // Register should write directly to backend canister storage (blockchain state).
    // If caller is authenticated, initialize access control to keep user role state in sync.
    if (not caller.isAnonymous()) {
      AccessControl.initialize(accessControlState, caller, "", "");
    };

    // Persist user record immediately in canister state.
    let userId = nextUserId;
    nextUserId += 1;

    let newUser : User = {
      id = userId;
      principal = caller;
      name;
      email;
      role;
      ktm;
      bankAccount;
      gpa;
      isVerified = false;
    };

    users.add(userId, newUser);

    // Also persist profile state (direct blockchain write as well)
    let profile : UserProfile = {
      name;
      email;
      role;
      ktm;
      bankAccount;
      gpa;
      isVerified = false;
    };
    userProfiles.add(caller, profile);

    userId;
  };

  public query ({ caller }) func getUser(id : Nat) : async User {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view user details");
    };

    switch (users.get(id)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        // Users can only view their own profile unless they're admin
        if (user.principal != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own profile");
        };
        user;
      };
    };
  };

  public shared ({ caller }) func verifyUser(userId : Nat) : async () {
    // Only admins can verify users
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can verify users");
    };

    switch (users.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        users.add(userId, { user with isVerified = true });

        // Update profile if exists
        switch (userProfiles.get(user.principal)) {
          case (?profile) {
            userProfiles.add(user.principal, { profile with isVerified = true });
          };
          case (null) {};
        };
      };
    };
  };

  public query ({ caller }) func getUsersByRole(role : Text) : async [User] {
    // Allow guest access so demo login can fetch user lists before authentication.
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
      Runtime.trap("Unauthorized: Only users can view users by role");
    };

    users.values().toArray().filter(func(user) { Text.equal(user.role, role) });
  };

  public query ({ caller }) func getCurrentUser() : async ?User {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their profile");
    };

    getUserByPrincipal(caller);
  };

  // LOAN MANAGEMENT

  public shared ({ caller }) func createLoan(borrowerId : Nat, borrowerName : Text, major : Text, amount : Nat, tenor : Nat, monthlyInstallment : Float, purpose : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create loans");
    };

    // Verify the caller is the borrower
    switch (getUserByPrincipal(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        if (user.id != borrowerId) {
          Runtime.trap("Unauthorized: Can only create loans for yourself");
        };
        if (not Text.equal(user.role, "Borrower")) {
          Runtime.trap("Unauthorized: Only borrowers can create loans");
        };
      };
    };

    let loanId = nextLoanId;
    nextLoanId += 1;

    let loan : Loan = {
      id = loanId;
      borrowerId;
      borrowerName;
      major;
      amount;
      tenor;
      monthlyInstallment;
      interestRate = 2.0;
      purpose;
      status = "Pending";
      startDate = Time.now();
      aiScore = 0;
      investorId = 0;
    };

    loans.add(loanId, loan);
    loanId;
  };

  public query ({ caller }) func getLoan(id : Nat) : async Loan {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view loans");
    };

    switch (loans.get(id)) {
      case (null) { Runtime.trap("Loan not found") };
      case (?loan) {
        // Only loan participants or admins can view
        if (not isLoanParticipant(caller, id) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view loans you're involved in");
        };
        loan;
      };
    };
  };

  public shared ({ caller }) func updateLoanStatus(loanId : Nat, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update loan status");
    };

    switch (loans.get(loanId)) {
      case (null) { Runtime.trap("Loan not found") };
      case (?loan) {
        // Only loan participants or admins can update status
        if (not isLoanParticipant(caller, loanId) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update loans you're involved in");
        };
        loans.add(loanId, { loan with status });
      };
    };
  };

  public shared ({ caller }) func approveLoan(loanId : Nat, investorId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can approve loans");
    };

    // Verify the caller is an investor
    switch (getUserByPrincipal(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        if (user.id != investorId) {
          Runtime.trap("Unauthorized: Can only approve loans as yourself");
        };
        if (not Text.equal(user.role, "Investor")) {
          Runtime.trap("Unauthorized: Only investors can approve loans");
        };
      };
    };

    switch (loans.get(loanId)) {
      case (null) { Runtime.trap("Loan not found") };
      case (?loan) {
        loans.add(loanId, { loan with investorId });
      };
    };
  };

  public query ({ caller }) func getAllLoans() : async [Loan] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view all loans");
    };

    loans.values().toArray().sort();
  };

  public query ({ caller }) func getLoansByBorrower(borrowerId : Nat) : async [Loan] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view loans");
    };

    // Users can only view their own loans unless they're admin
    switch (getUserByPrincipal(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        if (user.id != borrowerId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own loans");
        };
      };
    };

    let loanList = loans.values().toArray().filter(func(loan) { loan.borrowerId == borrowerId });
    loanList.sort(Loan.compareByBorrower);
  };

  public query ({ caller }) func getLoansByInvestor(investorId : Nat) : async [Loan] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view loans");
    };

    // Users can only view their own loans unless they're admin
    switch (getUserByPrincipal(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        if (user.id != investorId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own loans");
        };
      };
    };

    let loanList = loans.values().toArray().filter(func(loan) { loan.investorId == investorId });
    loanList.sort(Loan.compareByInvestor);
  };

  // PAYMENT TRACKING

  public shared ({ caller }) func recordPayment(loanId : Nat, amount : Nat, remainingInstallment : Float, status : Text, virtualAccount : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can record payments");
    };

    switch (loans.get(loanId)) {
      case (null) { Runtime.trap("Loan not found") };
      case (?loan) {
        // Only the borrower or admin can record payments
        switch (getUserByPrincipal(caller)) {
          case (null) { Runtime.trap("User not found") };
          case (?user) {
            if (user.id != loan.borrowerId and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Only the borrower can record payments");
            };
          };
        };

        let paymentId = nextPaymentId;
        nextPaymentId += 1;

        let payment : Payment = {
          id = paymentId;
          loanId;
          amount;
          paymentDate = Time.now();
          remainingInstallment;
          status;
          virtualAccount;
        };

        payments.add(paymentId, payment);
        paymentId;
      };
    };
  };

  public query ({ caller }) func getPaymentsByLoan(loanId : Nat) : async [Payment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view payments");
    };

    // Only loan participants or admins can view payments
    if (not isLoanParticipant(caller, loanId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view payments for loans you're involved in");
    };

    let paymentList = payments.values().toArray().filter(func(payment) { payment.loanId == loanId });
    paymentList.sort(Payment.compareByLoan);
  };

  public query ({ caller }) func getCicilanSisa(loanId : Nat) : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view remaining installments");
    };

    // Only loan participants or admins can view
    if (not isLoanParticipant(caller, loanId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view remaining installments for loans you're involved in");
    };

    var sisa : Float = 0;
    payments.values().forEach(func(payment) { if (payment.loanId == loanId) { sisa += payment.remainingInstallment } });
    sisa;
  };

  public shared ({ caller }) func createVirtualAccount(loanId : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create virtual accounts");
    };

    switch (loans.get(loanId)) {
      case (null) { Runtime.trap("Loan not found") };
      case (?loan) {
        // Only the borrower or admin can create virtual accounts
        switch (getUserByPrincipal(caller)) {
          case (null) { Runtime.trap("User not found") };
          case (?user) {
            if (user.id != loan.borrowerId and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Only the borrower can create virtual accounts");
            };
          };
        };
      };
    };

    "VA" # loanId.toText() # Time.now().toText();
  };

  // AI SCORING

  public query ({ caller }) func scoreApplicant(input : ScoringInput) : async ScoringResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can score applicants");
    };

    var score : Nat = 50;
    var recommendation : Text = "Reconsider";
    var reason : Text = "Average score";

    // Adjust score based on GPA
    if (input.gpa >= 3.5) { score += 20 } else if (input.gpa >= 3.0) {
      score += 10;
    };

    // Adjust score based on amount and tenor
    if (input.amount > 10000000 and input.tenor < 6) {
      if (score > 10) { score -= 10 };
    };
    if (Text.equal(input.purpose, "Education")) { score += 10 };

    if (input.cleanHistory) { score += 10 };

    // Set recommendation and reason
    if (score >= 80) {
      recommendation := "Approved";
      reason := "Good application";
    } else if (score >= 60) {
      recommendation := "Considered";
      reason := "Sufficient score";
    };

    { score; recommendation; reason };
  };

  // SEED DATA

  // Helper function to add seed data - Admin only
  public shared ({ caller }) func addSeedData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add seed data");
    };

    // Seed users
    let investors = ["Investor 1", "Investor 2", "Investor 3"];
    let borrowers = ["Borrower 1", "Borrower 2", "Borrower 3", "Borrower 4", "Borrower 5"];

    for (student in investors.values()) {
      let userId = nextUserId;
      nextUserId += 1;
      users.add(
        userId,
        {
          id = userId;
          principal = caller;
          name = student;
          email = (student.replace(#char ' ', "") # "@email.com");
          role = "Investor";
          ktm = "123";
          bankAccount = "987654322";
          gpa = 0.0;
          isVerified = true;
        },
      );
    };

    for (student in borrowers.values()) {
      let userId = nextUserId;
      nextUserId += 1;
      users.add(
        userId,
        {
          id = userId;
          principal = caller;
          name = student;
          email = (student.replace(#char ' ', "") # "@email.com");
          role = "Borrower";
          ktm = "456";
          bankAccount = "987123456";
          gpa = 3.2;
          isVerified = true;
        },
      );
    };

    // Seed loans
    let loanId = nextLoanId;
    nextLoanId += 3;

    loans.add(
      loanId,
      {
        id = loanId;
        borrowerId = 4;
        borrowerName = "Borrower 1";
        major = "Computer Science";
        amount = 5000000;
        tenor = 12;
        monthlyInstallment = 458333.33;
        interestRate = 2.0;
        purpose = "Education";
        status = "Pending";
        startDate = Time.now();
        aiScore = 80;
        investorId = 1;
      },
    );

    loans.add(
      loanId + 1,
      {
        id = loanId + 1;
        borrowerId = 5;
        borrowerName = "Borrower 2";
        major = "Economics";
        amount = 8000000;
        tenor = 24;
        monthlyInstallment = 366666.67;
        interestRate = 2.0;
        purpose = "Business";
        status = "Active";
        startDate = Time.now();
        aiScore = 80;
        investorId = 1;
      },
    );

    loans.add(
      loanId + 2,
      {
        id = loanId + 2;
        borrowerId = 6;
        borrowerName = "Borrower 3";
        major = "Chemical Engineering";
        amount = 10000000;
        tenor = 6;
        monthlyInstallment = 1666666.67;
        interestRate = 2.0;
        purpose = "Education";
        status = "Paid";
        startDate = Time.now();
        aiScore = 80;
        investorId = 1;
      },
    );

    // Seed payments
    let paymentId = nextPaymentId;
    nextPaymentId += 2;

    payments.add(
      paymentId,
      {
        id = paymentId;
        loanId = loanId + 1;
        amount = 366666;
        paymentDate = Time.now();
        remainingInstallment = 3299999.98;
        status = "Unpaid";
        virtualAccount = "VA1";
      },
    );

    payments.add(
      paymentId + 1,
      {
        id = paymentId + 1;
        loanId = loanId + 2;
        amount = 1666666;
        paymentDate = Time.now();
        remainingInstallment = 0.0;
        status = "Paid";
        virtualAccount = "VA2";
      },
    );
  };
};
