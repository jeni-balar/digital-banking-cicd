package com.jeni.banking.controller;

import com.jeni.banking.model.Account;
import com.jeni.banking.model.Transaction;
import com.jeni.banking.service.BankingService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class BankingController {
    private final BankingService service;

    public BankingController(BankingService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "digital-banking");
    }

    @GetMapping("/accounts")
    public List<Account> accounts() {
        return service.getAccounts();
    }

    @PostMapping("/accounts")
    @ResponseStatus(HttpStatus.CREATED)
    public Account createAccount(@RequestBody Map<String, Object> body) {
        String name = String.valueOf(body.getOrDefault("customerName", "Customer"));
        double balance = Double.parseDouble(String.valueOf(body.getOrDefault("openingBalance", 0)));
        return service.createAccount(name, balance);
    }

    @PostMapping("/transactions")
    public Transaction transfer(@RequestBody Map<String, Object> body) {
        String from = String.valueOf(body.get("fromAccount"));
        String to = String.valueOf(body.get("toAccount"));
        double amount = Double.parseDouble(String.valueOf(body.get("amount")));
        return service.transfer(from, to, amount);
    }

    @GetMapping("/transactions")
    public List<Transaction> transactions() {
        return service.getTransactions();
    }
}
