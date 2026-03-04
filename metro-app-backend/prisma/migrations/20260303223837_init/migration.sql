-- CreateTable
CREATE TABLE "cards" (
    "cardid" SERIAL NOT NULL,
    "userid" INTEGER NOT NULL,
    "cardtypeid" INTEGER,
    "nfcuid" VARCHAR(50),
    "alias" VARCHAR(50),
    "balance" DECIMAL(10,2) DEFAULT 0.00,
    "status" VARCHAR(20) DEFAULT 'active',
    "registrationdate" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "lastrecharge" TIMESTAMP(6),
    "lastuse" TIMESTAMP(6),

    CONSTRAINT "cards_pkey" PRIMARY KEY ("cardid")
);

-- CreateTable
CREATE TABLE "cardstatushistory" (
    "historyid" SERIAL NOT NULL,
    "cardid" INTEGER NOT NULL,
    "previousstatus" VARCHAR(20) NOT NULL,
    "newstatus" VARCHAR(20) NOT NULL,
    "reason" TEXT,
    "adminuserid" INTEGER,
    "changedate" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cardstatushistory_pkey" PRIMARY KEY ("historyid")
);

-- CreateTable
CREATE TABLE "cardtypes" (
    "cardtypeid" SERIAL NOT NULL,
    "description" VARCHAR(100) NOT NULL,

    CONSTRAINT "cardtypes_pkey" PRIMARY KEY ("cardtypeid")
);

-- CreateTable
CREATE TABLE "cardusage" (
    "usageid" SERIAL NOT NULL,
    "cardid" INTEGER,
    "userid" INTEGER NOT NULL,
    "stationid" INTEGER NOT NULL,
    "fareapplied" DECIMAL(10,2) NOT NULL,
    "previousbalance" DECIMAL(10,2) NOT NULL,
    "newbalance" DECIMAL(10,2) NOT NULL,
    "usagedate" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "validationsuccessful" BOOLEAN DEFAULT true,
    "rejectionreason" VARCHAR(255),
    "usagetype" VARCHAR(20) DEFAULT 'card',

    CONSTRAINT "cardusage_pkey" PRIMARY KEY ("usageid")
);

-- CreateTable
CREATE TABLE "notifications" (
    "notificationid" SERIAL NOT NULL,
    "userid" INTEGER NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "message" TEXT NOT NULL,
    "readstatus" BOOLEAN DEFAULT false,
    "sentdate" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notificationid")
);

-- CreateTable
CREATE TABLE "paymentmethods" (
    "paymentid" SERIAL NOT NULL,
    "userid" INTEGER NOT NULL,
    "paymentmethodnumber" VARCHAR(25) NOT NULL,
    "cvv" INTEGER,
    "ex_month" INTEGER,
    "ex_year" INTEGER,

    CONSTRAINT "paymentmethods_pkey" PRIMARY KEY ("paymentid")
);

-- CreateTable
CREATE TABLE "recharges" (
    "rechargeid" SERIAL NOT NULL,
    "cardid" INTEGER NOT NULL,
    "userid" INTEGER NOT NULL,
    "amount" DECIMAL(5,2) NOT NULL,
    "previousbalance" DECIMAL(5,2) NOT NULL,
    "newbalance" DECIMAL(5,2) NOT NULL,
    "paymentmethod" VARCHAR(20) NOT NULL,
    "paymentreference" VARCHAR(100),
    "transactionstatus" VARCHAR(20) DEFAULT 'completed',
    "rechargedate" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deviceip" VARCHAR(45),
    "devicemodel" VARCHAR(100),

    CONSTRAINT "recharges_pkey" PRIMARY KEY ("rechargeid")
);

-- CreateTable
CREATE TABLE "stations" (
    "stationid" SERIAL NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "line" VARCHAR(10) NOT NULL,
    "address" TEXT,
    "active" BOOLEAN DEFAULT true,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,

    CONSTRAINT "stations_pkey" PRIMARY KEY ("stationid")
);

-- CreateTable
CREATE TABLE "users" (
    "userid" SERIAL NOT NULL,
    "username" VARCHAR(20),
    "firstname" VARCHAR(100) NOT NULL,
    "lastname" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20),
    "passwordhash" VARCHAR(255) NOT NULL,
    "registrationdate" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "lastaccess" TIMESTAMP(6),
    "status" VARCHAR(20) DEFAULT 'active',

    CONSTRAINT "users_pkey" PRIMARY KEY ("userid")
);

-- CreateTable
CREATE TABLE "deletedcards" (
    "deletedcardid" SERIAL NOT NULL,
    "originalcardid" INTEGER NOT NULL,
    "userid" INTEGER NOT NULL,
    "cardtypeid" INTEGER,
    "nfcuid" VARCHAR(50),
    "alias" VARCHAR(50),
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "status" VARCHAR(20),
    "registrationdate" TIMESTAMP(6),
    "lastrecharge" TIMESTAMP(6),
    "lastuse" TIMESTAMP(6),
    "deleteddate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transferredto" INTEGER,

    CONSTRAINT "deletedcards_pkey" PRIMARY KEY ("deletedcardid")
);

-- CreateTable
CREATE TABLE "adminusers" (
    "adminid" SERIAL NOT NULL,
    "firstname" VARCHAR(25),
    "lastname" VARCHAR(25),
    "email" VARCHAR(25),
    "phone" VARCHAR(12),
    "permissions" VARCHAR(100),

    CONSTRAINT "adminusers_pkey" PRIMARY KEY ("adminid")
);

-- CreateTable
CREATE TABLE "cardusagehistory" (
    "usageid" INTEGER NOT NULL,
    "cardid" INTEGER,
    "stationid" INTEGER,
    "fareapplied" DECIMAL(10,2),
    "previousbalance" DECIMAL(10,2),
    "newbalance" DECIMAL(10,2),
    "usagedate" TIMESTAMP(6),
    "validationsuccessful" BOOLEAN,
    "rejectionreason" VARCHAR(255),
    "usagetype" VARCHAR(20),

    CONSTRAINT "cardusagehistory_pkey" PRIMARY KEY ("usageid")
);

-- CreateIndex
CREATE UNIQUE INDEX "cards_nfcuid_key" ON "cards"("nfcuid");

-- CreateIndex
CREATE UNIQUE INDEX "stations_code_key" ON "stations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_cardtypeid_fkey" FOREIGN KEY ("cardtypeid") REFERENCES "cardtypes"("cardtypeid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_userid_fkey" FOREIGN KEY ("userid") REFERENCES "users"("userid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cardstatushistory" ADD CONSTRAINT "cardstatushistory_adminuserid_fkey" FOREIGN KEY ("adminuserid") REFERENCES "users"("userid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cardstatushistory" ADD CONSTRAINT "cardstatushistory_cardid_fkey" FOREIGN KEY ("cardid") REFERENCES "cards"("cardid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cardusage" ADD CONSTRAINT "cardusage_cardid_fkey" FOREIGN KEY ("cardid") REFERENCES "cards"("cardid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cardusage" ADD CONSTRAINT "cardusage_stationid_fkey" FOREIGN KEY ("stationid") REFERENCES "stations"("stationid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cardusage" ADD CONSTRAINT "cardusage_userid_fkey" FOREIGN KEY ("userid") REFERENCES "users"("userid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userid_fkey" FOREIGN KEY ("userid") REFERENCES "users"("userid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "paymentmethods" ADD CONSTRAINT "paymentmethods_userid_fkey" FOREIGN KEY ("userid") REFERENCES "users"("userid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recharges" ADD CONSTRAINT "recharges_cardid_fkey" FOREIGN KEY ("cardid") REFERENCES "cards"("cardid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recharges" ADD CONSTRAINT "recharges_userid_fkey" FOREIGN KEY ("userid") REFERENCES "users"("userid") ON DELETE NO ACTION ON UPDATE NO ACTION;
