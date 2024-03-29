package by.itransition.webconstructor.event;

import by.itransition.webconstructor.domain.User;
import by.itransition.webconstructor.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.context.MessageSource;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.util.Locale;
import java.util.UUID;

@Component
public class RegistrationListener implements ApplicationListener<OnRegistrationCompleteEvent> {

    @Autowired
    private UserService userService;

    @Autowired
    private MessageSource messages;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private Environment environment;

    @Override
    @Async
    public void onApplicationEvent(OnRegistrationCompleteEvent event) {
        confirmRegistration(event);
    }

    private void confirmRegistration(OnRegistrationCompleteEvent event) {
        User user = event.getUser();
        String token = UUID.randomUUID().toString();
        userService.createVerificationToken(user/*.getUsername()*/, token);
        try {
            mailSender.send(createMessage(user.getFirstname(), user.getEmail(), token,
                    event.getApplicationUrl(), event.getLocale()));
        } catch (MessagingException ex) {
            ex.printStackTrace();
        }
    }

    private MimeMessage createMessage(String name, String email, String token, String url, Locale locale) throws MessagingException {
        String subject = messages.getMessage("registration.confirmSubject", null, locale);
        String confirmationUrl = url
                + "/confirm?confirm_token=" + token;
        String message = messages.getMessage("registration.confirmMessage", new Object[] {name, confirmationUrl}, locale);
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
        helper.setTo(email);
        helper.setSubject(subject);
        helper.setText(message, true);
//        helper.setFrom(environment.getProperty("support.email"));
        helper.setFrom("vitas97@tut.by"); // FIXME: 02.08.2016
        return mimeMessage;
    }
}
