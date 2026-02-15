package com.incial.crm.scheduler;

import com.incial.crm.service.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AlertScheduler {
    
    private final AlertService alertService;
    
    /**
     * Run alert generation every hour
     * Cron: "0 0 * * * *" means: at minute 0 of every hour
     */
    @Scheduled(cron = "0 0 * * * *")
    public void generateDelayAlerts() {
        log.info("Scheduled alert generation started");
        try {
            alertService.generateDelayAlerts();
            log.info("Scheduled alert generation completed successfully");
        } catch (Exception e) {
            log.error("Error during scheduled alert generation", e);
        }
    }
}
