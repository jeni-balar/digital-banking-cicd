package com.jeni.banking.model;

import java.time.Instant;

public record Transaction(
        String id,
        String fromAccount,
        String toAccount,
        double amount,
        String status,
        Instant timestamp) {}
