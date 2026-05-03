
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var to = data.to;
    var otp = data.otp;
    var name = data.name;

    if (!to || !otp || !name) {
      return buildResponse(false, "Missing required fields");
    }

    var subject = "🎓 SODALIS - Kode Verifikasi Email Anda";
    var htmlBody =
      '<div style="font-family: \'Plus Jakarta Sans\', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f0f2f5; padding: 32px 16px;">' +
      '<div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(15,52,116,0.10);">' +
      '<div style="background: #1a3a5c; padding: 28px 32px; text-align: center;">' +
      '<span style="font-size: 2rem;">🎓</span>' +
      '<h1 style="color: white; margin: 8px 0 0; font-size: 1.4rem; font-weight: 800; letter-spacing: -0.5px;">SODALIS</h1>' +
      '<p style="color: rgba(255,255,255,0.65); font-size: 0.8rem; margin: 4px 0 0;">Decentralized Student Lending</p>' +
      '</div>' +
      '<div style="padding: 36px 32px;">' +
      '<p style="color: #1a3a5c; font-size: 1rem; font-weight: 600; margin: 0 0 8px;">Halo, ' + name + '! 👋</p>' +
      '<p style="color: #4a5568; font-size: 0.9rem; line-height: 1.7; margin: 0 0 28px;">Gunakan kode verifikasi berikut untuk mengkonfirmasi email Anda dan menyelesaikan pendaftaran akun SODALIS.</p>' +
      '<div style="background: #f3f8ff; border: 2px solid #1d6fbf; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">' +
      '<p style="color: #7a9ab5; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">Kode OTP Anda</p>' +
      '<p style="color: #1d6fbf; font-size: 2.5rem; font-weight: 900; letter-spacing: 10px; margin: 0; font-family: monospace;">' + otp + '</p>' +
      '</div>' +
      '<div style="background: #fffbeb; border-left: 3px solid #f59e0b; border-radius: 6px; padding: 12px 16px; margin: 0 0 24px;">' +
      '<p style="color: #92400e; font-size: 0.82rem; margin: 0;">⏱️ Kode ini berlaku selama <strong>10 menit</strong>. Jangan bagikan kode ini kepada siapapun.</p>' +
      '</div>' +
      '<p style="color: #9ca3af; font-size: 0.78rem; margin: 0;">Jika Anda tidak merasa mendaftar di SODALIS, abaikan email ini.</p>' +
      '</div>' +
      '<div style="background: #f9fafb; padding: 16px 32px; text-align: center; border-top: 1px solid #e5e7eb;">' +
      '<p style="color: #9ca3af; font-size: 0.75rem; margin: 0;">© 2024 SODALIS – Powered by ICP Blockchain</p>' +
      '</div>' +
      '</div>' +
      '</div>';

    GmailApp.sendEmail(to, subject, "Kode OTP SODALIS Anda: " + otp, {
      htmlBody: htmlBody,
      name: "SODALIS Team"
    });

    return buildResponse(true, "OTP sent successfully");
  } catch (err) {
    return buildResponse(false, "Error: " + err.toString());
  }
}

function buildResponse(success, message) {
  var output = ContentService.createTextOutput(
    JSON.stringify({ success: success, message: message })
  ).setMimeType(ContentService.MimeType.JSON);
  return output;
}

// Handle preflight CORS (GET request test)
function doGet(e) {
  return buildResponse(true, "SODALIS OTP Gateway is running");
}
