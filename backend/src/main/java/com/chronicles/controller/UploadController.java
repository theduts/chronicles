package com.chronicles.controller;

import com.chronicles.dto.upload.UploadImageResponse;
import com.chronicles.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.InputStream;
import java.net.URLConnection;
import java.util.Set;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
@Tag(name = "Uploads", description = "Endpoints para gerenciamento e upload de arquivos de mídia")
public class UploadController {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg");

    private final FileStorageService fileStorageService;

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload de imagem", description = "Envia uma imagem de até 5MB para armazenamento no MinIO/S3.")
    public ResponseEntity<UploadImageResponse> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O arquivo não pode ser vazio.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O tamanho do arquivo não pode exceder 5MB.");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        }

        String contentType = file.getContentType();
        boolean isImageContentType = contentType != null && contentType.startsWith("image/");
        boolean isAllowedExtension = ALLOWED_EXTENSIONS.contains(extension);

        if (!isImageContentType && !isAllowedExtension) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas arquivos de imagem são permitidos.");
        }

        String fileName = fileStorageService.uploadFile(file);
        String url = fileStorageService.getFileUrl(fileName);

        return ResponseEntity.status(HttpStatus.CREATED).body(new UploadImageResponse(fileName, url));
    }

    @GetMapping("/images/{fileName}")
    @Operation(summary = "Obter imagem", description = "Recupera o stream da imagem armazenada pelo nome do arquivo.")
    public ResponseEntity<Resource> getImage(@PathVariable String fileName) {
        InputStream stream = fileStorageService.getFile(fileName);
        String mimeType = URLConnection.guessContentTypeFromName(fileName);
        if (mimeType == null) {
            mimeType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, mimeType)
                .body(new InputStreamResource(stream));
    }
}
