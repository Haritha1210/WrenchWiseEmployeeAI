export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.BREVO_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL || 'computerscience@wrench-wise.com';
    const senderEmail = process.env.BREVO_SENDER_EMAIL || adminEmail;
    
    if (!apiKey) {
        return res.status(500).json({ error: "Server missing BREVO_API_KEY" });
    }
    
    const { to_email, to_name, password } = req.body;
    
    if (!to_email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    
    const emailData = {
        sender: { name: "Wrench Wise EmployAI", email: senderEmail },
        to: [{ email: to_email, name: to_name || "Counselor" }],
        subject: "Wrench Wise EmployAI - Account Access Approved",
        htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0369a1;">Account Access Approved</h2>
                <p>Hi ${to_name || "Counselor"},</p>
                <p>Your access to the Wrench Wise EmployAI platform has been permitted.</p>
                <p>You can now log in using your auto-generated secure credentials:</p>
                <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${to_email}</p>
                    <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
                </div>
                <p><em>Please note: You can change your password at any time by logging in and clicking the "Change Password" button in the top navigation bar.</em></p>
                <p>Best regards,<br>Admin Team</p>
            </div>
        `
    };

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });
        
        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Brevo API Error: ${response.status} - ${errBody}`);
        }
        
        res.status(200).json({ success: true, message: "Email sent via Brevo" });
    } catch (error) {
        console.error("Failed to send email via Brevo:", error);
        res.status(500).json({ error: error.message });
    }
}
