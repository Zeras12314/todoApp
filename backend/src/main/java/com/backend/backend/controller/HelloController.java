package com.backend.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin("http://localhost:4200")
public class HelloController {

    @GetMapping("hello")
    public String greet(){
        return "Hello World";
    }
}
