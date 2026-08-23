package com.jeni.banking;

import com.jeni.banking.model.Transaction;
import com.jeni.banking.service.BankingService;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class BankingApiTest {
    private BankingService service;

    @BeforeMethod
    public void setup() {
        service = new BankingService();
    }

    @Test
    public void accountsShouldExist() {
        Assert.assertEquals(service.getAccounts().size(), 2);
    }

    @Test
    public void successfulTransferShouldBeProcessed() {
        Transaction tx = service.transfer("ACC1001", "ACC1002", 1000);
        Assert.assertEquals(tx.status(), "SUCCESS");
        Assert.assertEquals(service.getAccounts().stream()
                .filter(a -> a.id().equals("ACC1001"))
                .findFirst().orElseThrow().balance(), 9000.0);
    }

    @Test
    public void insufficientFundsShouldFail() {
        Transaction tx = service.transfer("ACC1002", "ACC1001", 99999);
        Assert.assertEquals(tx.status(), "FAILED_INSUFFICIENT_FUNDS");
    }
}
