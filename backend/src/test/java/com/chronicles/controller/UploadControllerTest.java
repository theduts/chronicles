package com.chronicles.controller;

import com.chronicles.domain.Role;
import com.chronicles.domain.User;
import com.chronicles.repository.UserRepository;
import com.chronicles.security.JwtService;
import com.chronicles.service.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UploadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @MockBean
    private FileStorageService fileStorageService;

    private User testUser;
    private String authToken;

    @BeforeEach
    void setUp() {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        testUser = userRepository.save(User.builder()
                .username("uploader_" + unique)
                .email("uploader_" + unique + "@chronicles.com")
                .passwordHash("hashed")
                .role(Role.ROLE_USER)
                .isActive(true)
                .build());
        authToken = "Bearer " + jwtService.generateToken(testUser);
    }

    @Test
    @DisplayName("POST /api/uploads/images with valid image file should return 201 Created and response payload")
    void uploadImage_withValidFile_returns201WithFileNameAndUrl() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "avatar.png",
                "image/png",
                new byte[]{1, 2, 3, 4}
        );

        when(fileStorageService.uploadFile(any())).thenReturn("123e4567-e89b-12d3-a456-426614174000.png");
        when(fileStorageService.getFileUrl("123e4567-e89b-12d3-a456-426614174000.png"))
                .thenReturn("http://localhost:9000/chronicles/123e4567-e89b-12d3-a456-426614174000.png");

        mockMvc.perform(multipart("/api/uploads/images")
                        .file(file)
                        .header(HttpHeaders.AUTHORIZATION, authToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fileName").value("123e4567-e89b-12d3-a456-426614174000.png"))
                .andExpect(jsonPath("$.url").value("http://localhost:9000/chronicles/123e4567-e89b-12d3-a456-426614174000.png"));
    }

    @Test
    @DisplayName("POST /api/uploads/images exceeding 5MB should return 400 Bad Request")
    void uploadImage_withFileExceeding5MB_returns400BadRequest() throws Exception {
        byte[] largeBytes = new byte[5 * 1024 * 1024 + 1]; // 5MB + 1 byte
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "giant.jpg",
                "image/jpeg",
                largeBytes
        );

        mockMvc.perform(multipart("/api/uploads/images")
                        .file(file)
                        .header(HttpHeaders.AUTHORIZATION, authToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/uploads/images with empty file should return 400 Bad Request")
    void uploadImage_withEmptyFile_returns400BadRequest() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "empty.png",
                "image/png",
                new byte[0]
        );

        mockMvc.perform(multipart("/api/uploads/images")
                        .file(file)
                        .header(HttpHeaders.AUTHORIZATION, authToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/uploads/images with non-image file should return 400 Bad Request")
    void uploadImage_withNonImageFile_returns400BadRequest() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "script.sh",
                "text/plain",
                "echo hello".getBytes()
        );

        mockMvc.perform(multipart("/api/uploads/images")
                        .file(file)
                        .header(HttpHeaders.AUTHORIZATION, authToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/uploads/images without authentication should return 401 or 403")
    void uploadImage_unauthenticated_returnsUnauthorized() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "avatar.png",
                "image/png",
                new byte[]{1, 2, 3}
        );

        mockMvc.perform(multipart("/api/uploads/images")
                        .file(file))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/uploads/images/{fileName} should be publicly accessible and return 200")
    void getImage_withValidFileName_returns200WithStream() throws Exception {
        when(fileStorageService.getFile("avatar.png"))
                .thenReturn(new ByteArrayInputStream(new byte[]{1, 2, 3}));

        mockMvc.perform(get("/api/uploads/images/avatar.png"))
                .andExpect(status().isOk());
    }
}
