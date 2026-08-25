package com.buildfolio.backend.services;


import com.buildfolio.backend.entity.User;
import com.buildfolio.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.encrypt.TextEncryptor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    public final UserRepository userRepository;
    public final TextEncryptor textEncryptor;


    @Transactional(readOnly = true)
    public User requiredById(UUID id){
        return userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User Not found"));
    }

    public String decryptAccessToken(User user){
        return textEncryptor.decrypt(user.getAccessToken());
    }

    private static Long toLong(Object value){
        if(value instanceof Number number){
            return number.longValue();
        }
        return Long.parseLong(String.valueOf(value));
    }
}
