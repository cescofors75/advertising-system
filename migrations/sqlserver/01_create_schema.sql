-- ============================================================
-- SQL Server Schema for Advertising System
-- Target: Azure SQL Database
-- Auth: Hardcoded single user (no DB tables needed)
-- Date: 2026-02-17
-- ============================================================

-- ============================================================
-- 1. ADVERTISEMENTS TABLE
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'advertisements')
BEGIN
    CREATE TABLE advertisements (
        id                  BIGINT IDENTITY(1,1) NOT NULL,
        title               NVARCHAR(500)        NOT NULL,
        description         NVARCHAR(MAX)        NULL,
        media_url           NVARCHAR(2048)       NULL,
        media_type          NVARCHAR(20)         NOT NULL DEFAULT 'image',  -- 'image', 'video'
        active              BIT                  NOT NULL DEFAULT 1,

        -- Website / QR fields
        website_url         NVARCHAR(2048)       NULL,
        show_qr_code        BIT                  NOT NULL DEFAULT 0,
        qr_type             NVARCHAR(20)         NOT NULL DEFAULT 'web',    -- 'web', 'payment'
        qr_position         NVARCHAR(20)         NOT NULL DEFAULT 'top',    -- 'top', 'bottom'
        qr_color_web        NVARCHAR(20)         NOT NULL DEFAULT 'black',  -- 'black', 'blue', 'purple'
        qr_color_payment    NVARCHAR(20)         NOT NULL DEFAULT 'orange', -- 'orange', 'red', 'green', 'blue', 'indigo', 'pink', 'teal', 'white', 'purple'

        -- Payment fields
        product_name        NVARCHAR(500)        NULL,
        product_price       DECIMAL(10, 2)       NULL,
        payment_provider    NVARCHAR(50)         NULL,  -- 'stripe', 'googlepay', 'applepay'

        -- Time slot scheduling
        time_slot_morning   BIT                  NOT NULL DEFAULT 0,
        time_slot_afternoon BIT                  NOT NULL DEFAULT 0,
        time_slot_night     BIT                  NOT NULL DEFAULT 0,

        created_at          DATETIMEOFFSET       NOT NULL DEFAULT SYSUTCDATETIME(),

        CONSTRAINT PK_advertisements PRIMARY KEY (id),
        CONSTRAINT CK_advertisements_media_type CHECK (media_type IN ('image', 'video')),
        CONSTRAINT CK_advertisements_qr_type CHECK (qr_type IN ('web', 'payment')),
        CONSTRAINT CK_advertisements_qr_position CHECK (qr_position IN ('top', 'bottom'))
    );
END;
GO

-- Index on active for display queries
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_advertisements_active')
    CREATE NONCLUSTERED INDEX IX_advertisements_active 
        ON advertisements(active) 
        INCLUDE (title, media_url, media_type, time_slot_morning, time_slot_afternoon, time_slot_night);
GO

-- ============================================================
-- 2. SCHEDULES TABLE
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'schedules')
BEGIN
    CREATE TABLE schedules (
        id                  BIGINT IDENTITY(1,1) NOT NULL,
        advertisement_id    BIGINT               NOT NULL,
        start_time          DATETIMEOFFSET       NOT NULL,
        end_time            DATETIMEOFFSET       NOT NULL,
        created_at          DATETIMEOFFSET       NOT NULL DEFAULT SYSUTCDATETIME(),

        CONSTRAINT PK_schedules PRIMARY KEY (id),
        CONSTRAINT FK_schedules_advertisements FOREIGN KEY (advertisement_id) 
            REFERENCES advertisements(id) ON DELETE CASCADE,
        CONSTRAINT CK_schedules_time_range CHECK (end_time > start_time)
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_schedules_advertisement_id')
    CREATE NONCLUSTERED INDEX IX_schedules_advertisement_id 
        ON schedules(advertisement_id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_schedules_time_range')
    CREATE NONCLUSTERED INDEX IX_schedules_time_range 
        ON schedules(start_time, end_time) 
        INCLUDE (advertisement_id);
GO

-- ============================================================
-- 3. CONNECTED_DEVICES TABLE
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'connected_devices')
BEGIN
    CREATE TABLE connected_devices (
        id                  NVARCHAR(200)        NOT NULL,  -- device_XXXXX_XXXXX format
        name                NVARCHAR(200)        NULL,
        ip                  NVARCHAR(45)         NULL,      -- IPv4 or IPv6
        last_seen           DATETIMEOFFSET       NOT NULL DEFAULT SYSUTCDATETIME(),
        os                  NVARCHAR(100)        NULL,
        browser             NVARCHAR(100)        NULL,
        device_type         NVARCHAR(50)         NULL,      -- 'desktop', 'tablet', 'mobile'
        location            NVARCHAR(500)        NULL,
        status              NVARCHAR(20)         NOT NULL DEFAULT 'offline',  -- 'online', 'offline'
        network             NVARCHAR(50)         NULL,      -- '4g', 'wifi', etc.
        resolution          NVARCHAR(20)         NULL,      -- '1920x1080'
        user_agent          NVARCHAR(MAX)        NULL,
        first_seen          DATETIMEOFFSET       NOT NULL DEFAULT SYSUTCDATETIME(),
        battery             NVARCHAR(10)         NULL,
        memory_usage        NVARCHAR(50)         NULL,
        cpu_usage           NVARCHAR(50)         NULL,
        current_ad          NVARCHAR(500)        NULL,
        current_time_slot   NVARCHAR(20)         NULL,

        CONSTRAINT PK_connected_devices PRIMARY KEY (id),
        CONSTRAINT CK_connected_devices_status CHECK (status IN ('online', 'offline'))
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_connected_devices_status')
    CREATE NONCLUSTERED INDEX IX_connected_devices_status 
        ON connected_devices(status) 
        INCLUDE (name, last_seen, device_type, current_ad);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_connected_devices_last_seen')
    CREATE NONCLUSTERED INDEX IX_connected_devices_last_seen 
        ON connected_devices(last_seen DESC) 
        INCLUDE (status);
GO

-- ============================================================
-- 4. AD_VIEWS TABLE (analytics / log)
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ad_views')
BEGIN
    CREATE TABLE ad_views (
        id                  BIGINT IDENTITY(1,1) NOT NULL,
        device_id           NVARCHAR(200)        NOT NULL,
        ad_id               BIGINT               NOT NULL,
        [timestamp]         DATETIMEOFFSET       NOT NULL DEFAULT SYSUTCDATETIME(),
        time_slot           NVARCHAR(20)         NULL,      -- 'morning', 'afternoon', 'night'

        CONSTRAINT PK_ad_views PRIMARY KEY (id),
        CONSTRAINT FK_ad_views_devices FOREIGN KEY (device_id) 
            REFERENCES connected_devices(id) ON DELETE CASCADE,
        CONSTRAINT FK_ad_views_advertisements FOREIGN KEY (ad_id) 
            REFERENCES advertisements(id) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ad_views_device_id')
    CREATE NONCLUSTERED INDEX IX_ad_views_device_id 
        ON ad_views(device_id) 
        INCLUDE ([timestamp], ad_id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ad_views_ad_id')
    CREATE NONCLUSTERED INDEX IX_ad_views_ad_id 
        ON ad_views(ad_id) 
        INCLUDE ([timestamp], device_id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ad_views_timestamp')
    CREATE NONCLUSTERED INDEX IX_ad_views_timestamp 
        ON ad_views([timestamp] DESC) 
        INCLUDE (device_id, ad_id, time_slot);
GO

-- ============================================================
-- 5. STORED PROCEDURES (utility)
-- ============================================================

-- Mark devices as offline if not seen within threshold
CREATE OR ALTER PROCEDURE sp_UpdateOfflineDevices
    @ThresholdMinutes INT = 5
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ThresholdTime DATETIMEOFFSET = DATEADD(MINUTE, -@ThresholdMinutes, SYSUTCDATETIME());
    
    UPDATE connected_devices
    SET status = 'offline'
    WHERE status = 'online'
      AND last_seen < @ThresholdTime;
    
    SELECT @@ROWCOUNT AS DevicesMarkedOffline;
END;
GO

-- Get active advertisements for a specific time slot
CREATE OR ALTER PROCEDURE sp_GetActiveAdsByTimeSlot
    @TimeSlot NVARCHAR(20)  -- 'morning', 'afternoon', 'night'
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT *
    FROM advertisements
    WHERE active = 1
      AND (
          (@TimeSlot = 'morning'   AND time_slot_morning = 1) OR
          (@TimeSlot = 'afternoon' AND time_slot_afternoon = 1) OR
          (@TimeSlot = 'night'     AND time_slot_night = 1)
      )
    ORDER BY id;
END;
GO

-- Get device statistics
CREATE OR ALTER PROCEDURE sp_GetDeviceStats
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        COUNT(*)                                            AS TotalDevices,
        SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) AS OnlineDevices,
        COUNT(DISTINCT NULLIF(location, ''))                AS UniqueLocations
    FROM connected_devices;
    
    SELECT COUNT(*) AS TotalAdViews FROM ad_views;
END;
GO

-- Upsert connected device (used by display clients)
CREATE OR ALTER PROCEDURE sp_UpsertConnectedDevice
    @Id              NVARCHAR(200),
    @Name            NVARCHAR(200)   = NULL,
    @Ip              NVARCHAR(45)    = NULL,
    @Os              NVARCHAR(100)   = NULL,
    @Browser         NVARCHAR(100)   = NULL,
    @DeviceType      NVARCHAR(50)    = NULL,
    @Location        NVARCHAR(500)   = NULL,
    @Status          NVARCHAR(20)    = 'online',
    @Network         NVARCHAR(50)    = NULL,
    @Resolution      NVARCHAR(20)    = NULL,
    @UserAgent       NVARCHAR(MAX)   = NULL,
    @Battery         NVARCHAR(10)    = NULL,
    @CurrentAd       NVARCHAR(500)   = NULL,
    @CurrentTimeSlot NVARCHAR(20)    = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    MERGE connected_devices AS target
    USING (SELECT @Id AS id) AS source
    ON target.id = source.id
    WHEN MATCHED THEN
        UPDATE SET
            name              = COALESCE(@Name, target.name),
            ip                = COALESCE(@Ip, target.ip),
            last_seen         = SYSUTCDATETIME(),
            os                = COALESCE(@Os, target.os),
            browser           = COALESCE(@Browser, target.browser),
            device_type       = COALESCE(@DeviceType, target.device_type),
            location          = COALESCE(@Location, target.location),
            status            = @Status,
            network           = COALESCE(@Network, target.network),
            resolution        = COALESCE(@Resolution, target.resolution),
            user_agent        = COALESCE(@UserAgent, target.user_agent),
            battery           = COALESCE(@Battery, target.battery),
            current_ad        = @CurrentAd,
            current_time_slot = @CurrentTimeSlot
    WHEN NOT MATCHED THEN
        INSERT (id, name, ip, last_seen, os, browser, device_type, location, 
                status, network, resolution, user_agent, first_seen, battery, 
                current_ad, current_time_slot)
        VALUES (@Id, @Name, @Ip, SYSUTCDATETIME(), @Os, @Browser, @DeviceType, @Location,
                @Status, @Network, @Resolution, @UserAgent, SYSUTCDATETIME(), @Battery,
                @CurrentAd, @CurrentTimeSlot);
END;
GO

PRINT '✅ Schema created successfully for Azure SQL Database';
GO
