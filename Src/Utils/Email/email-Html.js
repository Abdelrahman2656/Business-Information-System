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
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <title>Student Credentials</title>
  
    </head>
    <body style="
      margin: 0;
      font-family: 'Poppins', sans-serif;
      background: #f7f7f7;
      font-size: 14px;
      line-height: 1.5;
      color: #333333;
    ">
      <div style="
        max-width: 600px;
        margin: 0 auto;
        padding: 0;
        background: #ffffff;
      ">
        <div style="
          padding: 32px 40px;
          background-image: linear-gradient(135deg, #1a3a6c 0%, #2c5eaa 100%);
          border-radius: 0 0 16px 16px;
          position: relative;
          overflow: hidden;
        ">
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: url('https://bis-wine.vercel.app/mailImage.jpg') !important;
            background-size: cover;
            background-position: center;
            opacity: 0.1;
          "></div>

          <table style="width: 100%; position: relative; z-index: 2;">
            <tbody>
              <tr>
                <td>
                  <img
                    alt="BIS Logo"
                    src="https://bis-wine.vercel.app/logo.png"
                    height="64px"
                    style="filter: brightness(0) invert(1);"
                  />
                </td>
                <td style="text-align: right;">
                  <span style="
                    font-size: 14px;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.9) !important;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 6px 12px;
                    border-radius: 16px;
                  ">${formattedDate}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="padding: 0 40px;">
          <div style="margin: 40px 0 32px; text-align: center;">
            <h1 style="
              margin: 0;
              font-size: 24px;
              font-weight: 600;
              color: #1a3a6c;
              letter-spacing: -0.5px;
            ">Your Student Credentials</h1>
            <div style="width: 48px; height: 4px; background-color: #ba3d4f; margin: 16px auto;"></div>
            <p style="
              margin: 24px 0 0;
              font-size: 16px;
              color: #555;
              max-width: 480px;
              margin-left: auto;
              margin-right: auto;
            ">
              Welcome to <strong>Business Information System</strong>. Please find your access credentials below.
              For security reasons, we recommend changing your password after the first login.
            </p>
          </div>

          <div style="
            border-radius: 16px;
            background: linear-gradient(145deg, #f0f4ff 0%, #f8f9ff 100%);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
            padding: 32px;
            margin: 32px 0;
            border-left: 4px solid #1a3a6c;
          ">
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
              <div style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: rgba(26, 58, 108, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 16px;
              ">
                <img src="https://img.icons8.com/?size=100&id=EHyUO6ZGSRkX&format=png&color=000000"
                alt="lock icon" style="width: 20px; height: 20px; display: block;" />
              </div>
              <h2 style="
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #1a3a6c;
              ">Secure Access Information</h2>
            </div>

            <div style="
              padding: 16px;
              background-color: rgba(255, 255, 255, 0.8);
              border-radius: 8px;
              margin-bottom: 16px;
              border: 1px solid rgba(0, 0, 0, 0.05);
            ">
              <p style="
                margin: 0 0 8px 0;
                font-size: 13px;
                font-weight: 500;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 1px;
              ">Student ID</p>
              <p style="
                margin: 0;
                font-family: 'Courier New', monospace;
                font-size: 18px;
                font-weight: 600;
                color: #1a3a6c;
                letter-spacing: 0.5px;
                background-color: rgba(26, 58, 108, 0.05);
                border-radius: 4px;
                padding: 8px 12px;
                display: inline-block;
              ">${customId}</p>
            </div>

            <div style="
              padding: 16px;
              background-color: rgba(255, 255, 255, 0.8);
              border-radius: 8px;
              border: 1px solid rgba(0, 0, 0, 0.05);
            ">
              <p style="
                margin: 0 0 8px 0;
                font-size: 13px;
                font-weight: 500;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 1px;
              ">Password</p>
              <p style="
                margin: 0;
                font-family: 'Courier New', monospace;
                font-size: 18px;
                font-weight: 600;
                color: #ba3d4f;
                letter-spacing: 0.5px;
                background-color: rgba(186, 61, 79, 0.05);
                border-radius: 4px;
                padding: 8px 12px;
                display: inline-block;
              ">${password}</p>
            </div>

            <div style="
              margin-top: 24px;
              padding: 16px;
              background-color: rgba(255, 253, 235, 0.8);
              border-radius: 8px;
              border-left: 3px solid #e9b949;
            ">
              <div style="display: flex; align-items: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e9b949" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <p style="
                  margin: 0 0 0 8px;
                  font-size: 13px;
                  font-weight: 500;
                  color: #94711c;
                ">Security Notice</p>
              </div>
              <p style="
                margin: 8px 0 0 0;
                font-size: 13px;
                color: #94711c;
              ">Do not share these credentials with anyone, including Business Information System employees. This information is confidential and for your use only.</p>
            </div>
          </div>

          <div style="
            margin: 32px 0;
            padding: 24px;
            background-color: #f8f9ff;
            border-radius: 12px;
          ">
            <h3 style="
              margin: 0 0 16px 0;
              font-size: 16px;
              font-weight: 600;
              color: #1a3a6c;
            ">Next Steps</h3>
            <ul style="
              margin: 0;
              padding: 0 0 0 24px;
              color: #555;
            ">
              <li style="margin-bottom: 8px;">Log in to your student portal using the provided credentials.</li>
              <li style="margin-bottom: 8px;">Change your password immediately for security purposes.</li>
              <li style="margin-bottom: 8px;">Complete your student profile and upload required documents.</li>
              <li>Review the orientation materials in your dashboard.</li>
            </ul>
          </div>
               <!-- Help Section -->
            <div style="
              margin: 32px 0;
              text-align: center;
              padding: 24px;
              background-color: #fff;
              border-radius: 12px;
              border: 1px dashed #e0e0e0;
            ">
              <h3 style="
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: #1a3a6c;
              ">Need Assistance?</h3>
              
              <p style="
                margin: 16px 0;
                font-size: 14px;
                color: #555;
              ">
                Our support team is available to help you with any questions or issues you may encounter.
              </p>
              
              <a href="mailto:info@hti.edu.eg" style="
                display: inline-block;
                padding: 8px 24px;
                background-color: #1a3a6c;
                color: #ffffff;
                text-decoration: none;
                font-weight: 500;
                border-radius: 4px;
                font-size: 14px;
                transition: background-color 0.3s ease;
              ">Contact Support</a>
              
              <p style="
                margin: 16px 0 0 0;
                font-size: 13px;
                color: #999;
              ">
                Email: <a href="mailto:info@hti.edu.eg" style="color: #1a3a6c; text-decoration: none;">info@hti.edu.eg</a> | Phone: 055 4351292
              </p>
            </div>
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
};
