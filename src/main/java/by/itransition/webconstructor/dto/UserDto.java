package by.itransition.webconstructor.dto;

import by.itransition.webconstructor.domain.Role;
import by.itransition.webconstructor.domain.User;
import by.itransition.webconstructor.validation.PasswordMatches;
import by.itransition.webconstructor.validation.ValidEmail;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.util.Date;

@Data
@NoArgsConstructor
@PasswordMatches
public class UserDto {

    @NotNull
    @Size(min = 2, max = 60)
    private String firstname;

    @NotNull
    @Size(min = 2, max = 60)
    private String lastname;

    @ValidEmail
    @NotNull
    @Size(min = 6, max = 60)
    private String email;

    @NotNull
    @Size(min = 8, max = 60)
    private String password;

    private String matchingPassword;

    @NotNull
    @Size(min = 5, max = 60)
    @Pattern(regexp = "^[A-Za-z0-9]+$")
    private String username;

    private String oldPassword;

    private String avatar;

    private boolean active;

    private boolean admin;

    private Date registered;

    public UserDto(User user) {
        this.firstname = user.getFirstname();
        this.lastname = user.getLastname();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.avatar = user.getAvatar();
        this.active = user.isAccountNonLocked();
        this.admin = user.getRole().equals(Role.ROLE_ADMIN);
        this.registered = user.getRegistrationDate();
    }
}
