package com.fitlife.config;

import com.fitlife.model.User;
import com.fitlife.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DemoUserProvider {

    private final UserRepository userRepository;

    public User getUser() {
        return userRepository.findById(1L)
                .orElseThrow(() -> new IllegalStateException("Demo user (id=1) not found. Check data.sql seed."));
    }
}
