package com.gl.hive.AuthenticationService.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Demo controller for testing authorization and authentication. (since i'm not very good at writing tests)
 */
@SuppressWarnings("SameReturnValue")
@RestController
@RequestMapping("/authenticated")
public class DemoController {

    @GetMapping("/pl")
    @PreAuthorize("hasAuthority('ROLE_PROJECT_LEADER')")
    public String demo() {
        return "PROJECT_LEADER :: this is for testing authentication and authorization";
    }

    @GetMapping("/pa")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public String demo1() {
        return "ADMIN :: this is for testing authentication and authorization";
    }


    @GetMapping("/tm")
    @PreAuthorize("hasAuthority('ROLE_TEAM_MEMBER')")
    public String demo2() {
        return "TEAM_MEMBER :: this is for testing authentication and authorization";
    }


    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('ROLE_PROJECT_LEADER', 'ROLE_ADMIN', 'ROLE_TEAM_MEMBER')")
    public String demo3() {
        return "'PROJECT_LEADER', 'ADMIN', 'TEAM_MEMBER' :: this is for testing authentication and authorization";
    }

}
