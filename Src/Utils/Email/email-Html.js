export const emailHtml = (customId, password) => {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.toLocaleString("en-US", { month: "short" });
  const year = currentDate.getFullYear();
  const formattedDate = `${day} ${month}, ${year}`;
  return `
  <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Student Credentials</title>
      </head>
      <body style="
        margin: 0;
        font-family: Arial, sans-serif;
        background: #f7f7f7;
        font-size: 14px;
        line-height: 1.5;
        color: #333333;
      ">
        <div style="
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background: #ffffff;
        ">
          <div style="
            padding: 20px;
            background: #1a3a6c;
            color: white;
            text-align: center;
            border-radius: 8px;
          ">
            <h1 style="margin: 0;">Your Student Credentials</h1>
            <p style="margin: 10px 0 0;">${formattedDate}</p>
          </div>

          <div style="padding: 20px;">
            <p style="margin: 0 0 20px;">
              Welcome to <strong>Business Information System</strong>. Please find your access credentials below.
              For security reasons, we recommend changing your password after the first login.
            </p>

            <div style="
              background: #f8f9ff;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            ">
              <h2 style="margin: 0 0 15px; color: #1a3a6c;">Student ID</h2>
              <p style="
                margin: 0;
                font-family: monospace;
                font-size: 18px;
                background: #fff;
                padding: 10px;
                border-radius: 4px;
              ">${customId}</p>
            </div>

            <div style="
              background: #f8f9ff;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            ">
              <h2 style="margin: 0 0 15px; color: #1a3a6c;">Password</h2>
              <p style="
                margin: 0;
                font-family: monospace;
                font-size: 18px;
                background: #fff;
                padding: 10px;
                border-radius: 4px;
                color: #ba3d4f;
              ">${password}</p>
            </div>

            <div style="
              background: #fff3cd;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
            ">
              <p style="margin: 0; color: #856404;">
                <strong>Security Notice:</strong> Do not share these credentials with anyone, including Business Information System employees. This information is confidential and for your use only.
              </p>
            </div>

            <div style="margin-top: 30px;">
              <h3 style="margin: 0 0 15px; color: #1a3a6c;">Next Steps:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Log in to your student portal using the provided credentials.</li>
                <li style="margin-bottom: 8px;">Change your password immediately for security purposes.</li>
                <li style="margin-bottom: 8px;">Complete your student profile and upload required documents.</li>
                <li>Review the orientation materials in your dashboard.</li>
              </ul>
            </div>

            <div style="
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: center;
              color: #666;
            ">
              <p style="margin: 0;">
                Need help? Contact us at <a href="mailto:info@hti.edu.eg" style="color: #1a3a6c;">info@hti.edu.eg</a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};
