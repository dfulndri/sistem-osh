/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
    // Only send welcome email on initial signup, not on password reset
    if (e.record.get("passwordResetToken")) {
        e.next();
        return;
    }

    const message = new MailerMessage({
        from: {
            address: $app.settings().meta.senderAddress,
            name: $app.settings().meta.senderName
        },
        to: [{ address: e.record.get("email") }],
        subject: "Welcome to Risk Analysis Platform",
        html: "<h1>Welcome!</h1><p>Your account has been created successfully. You can now log in and start creating analyses.</p>"
    });
    $app.newMailClient().send(message);
    e.next();
}, "users");

onRecordUpdate((e) => {
    // Check if passwordResetToken was just set (password reset initiated)
    const original = e.record.original();
    const newToken = e.record.get("passwordResetToken");
    const oldToken = original.get("passwordResetToken");

    if (newToken && newToken !== oldToken) {
        // Token was just created, send reset email
        const resetLink = "https://yourapp.com/reset-password?token=" + newToken;
        const message = new MailerMessage({
            from: {
                address: $app.settings().meta.senderAddress,
                name: $app.settings().meta.senderName
            },
            to: [{ address: e.record.get("email") }],
            subject: "Password Reset Request",
            html: "<h1>Password Reset</h1><p>Click the link below to reset your password:</p><p><a href='" + resetLink + "'>Reset Password</a></p><p>This link expires in 1 hour.</p><p>If you didn't request this, please ignore this email.</p>"
        });
        $app.newMailClient().send(message);
    }

    e.next();
}, "users");