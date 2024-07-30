const {ethers} = require("hardhat");
const {expect} = require("chai");
const ethUtil = require("ethereumjs-util")
const {BigNumber} = require("ethers");

describe("C2NSale", function () {

    let Admin;
    let C2NSale;
    let C2NToken;
    let BobaToken;
    let SalesFactory;
    let AllocationStaking;
    let deployer, alice, bob;
    let AllocationStakingRewardsFactory;
    let startTimestamp;
    let ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
    let ONE_ADDRESS = "0x0000000000000000000000000000000000000001";

    let vestingPortionsUnlockTime = [];
    let vestingPercentPerPortion = [];

    const DECIMALS = 18; // Working with non-18 decimals
    const MULTIPLIER = (10 ** DECIMALS).toString();
    const REV = (10 ** (18 - DECIMALS)).toString();

    const REWARDS_PER_SECOND = ethers.utils.parseUnits("0.1");
    const START_TIMESTAMP_DELTA = 600;
    const NUMBER_1E36 = "1000000000000000000000000000000000000";
    const NUMBER_1E18 = "1000000000000000000";

    const TOKEN_PRICE_IN_ETH = 1e11;
    // const AMOUNT_OF_TOKENS_TO_SELL = 100 * NUMBER_1E18 * (NUMBER_1E18 / TOKEN_PRICE_IN_ETH) * REV;
    const AMOUNT_OF_TOKENS_TO_SELL = BigNumber.from(100000000).mul(NUMBER_1E18);
    const SALE_END_DELTA = 100;
    const TOKENS_UNLOCK_TIME_DELTA = 150;
    const REGISTRATION_TIME_STARTS_DELTA = 10;
    const REGISTRATION_TIME_ENDS_DELTA = 40;
    const PORTION_VESTING_PRECISION = 100;
    const SALE_START_DELTA = 50;
    const MAX_PARTICIPATION = BigNumber.from(10000000).mul(NUMBER_1E18).mul(REV)
    const PARTICIPATION_AMOUNT = BigNumber.from(10000000).mul(NUMBER_1E18).mul(REV);
    const PARTICIPATION_VALUE = BigNumber.from(1).mul(NUMBER_1E18).mul(REV);

    const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY

    function firstOrDefault(first, key, def) {
        if (first && first[key] !== undefined) {
            return first[key];
        }
        return def;
    }

    function generateSignature(digest, privateKey) {
        // prefix with "\x19Ethereum Signed Message:\n32"
        // Reference: https://github.com/OpenZeppelin/openzeppelin-contracts/issues/890
        const prefixedHash = ethUtil.hashPersonalMessage(ethUtil.toBuffer(digest));

        // sign message
        const {v, r, s} = ethUtil.ecsign(prefixedHash, Buffer.from(privateKey, 'hex'))

        // generate signature by concatenating r(32), s(32), v(1) in this order
        // Reference: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/76fe1548aee183dfcc395364f0745fe153a56141/contracts/ECRecovery.sol#L39-L43
        const vb = Buffer.from([v]);
        const signature = Buffer.concat([r, s, vb]);

        return signature;
    }

    function signRegistration(userAddress, contractAddress, privateKey) {
        // compute keccak256(abi.encodePacked(user, address(this)))
        const digest = ethers.utils.keccak256(ethers.utils.solidityPack(['address', 'address'], [userAddress, contractAddress]));

        return generateSignature(digest, privateKey);
    }

    function signParticipation(userAddress, amount, contractAddress, privateKey) {
        // compute keccak256(abi.encodePacked(user, amount))
        const digest = ethers.utils.keccak256(ethers.utils.solidityPack(['address', 'uint256', 'address'], [userAddress, amount, contractAddress]));

        return generateSignature(digest, privateKey);
    }

    function participate(params) {
        const registrant = firstOrDefault(params, 'sender', deployer);

        const userAddress = registrant.address;
        const participationAmount = firstOrDefault(params, 'participationAmount', PARTICIPATION_AMOUNT);
        const value = firstOrDefault(params, "participationValue", PARTICIPATION_VALUE);
        // console.log(participationAmount, value);
        const sig = signParticipation(userAddress, participationAmount, C2NSale.address, DEPLOYER_PRIVATE_KEY); // backend signature
        return C2NSale.connect(registrant).participate(sig, participationAmount, {value: value});   // contract
    }

    async function getCurrentBlockTimestamp() {
        return (await ethers.provider.getBlock('latest')).timestamp;
    }

    async function setSaleParams(params) {
        const blockTimestamp = await getCurrentBlockTimestamp();

        const token = firstOrDefault(params, 'token', C2NToken.address);
        const saleOwner = firstOrDefault(params, 'saleOwner', deployer.address);
        const tokenPriceInETH = firstOrDefault(params, 'tokenPriceInETH', TOKEN_PRICE_IN_ETH);
        const amountOfTokensToSell = firstOrDefault(params, 'amountOfTokensToSell', AMOUNT_OF_TOKENS_TO_SELL);
        const saleEnd = blockTimestamp + firstOrDefault(params, 'saleEndDelta', SALE_END_DELTA);
        const tokensUnlockTime = blockTimestamp + firstOrDefault(params, 'tokensUnlockTimeDelta', TOKENS_UNLOCK_TIME_DELTA);
        const maxParticipation = firstOrDefault(params, 'maxParticipation', MAX_PARTICIPATION);

        return await C2NSale.setSaleParams(token, saleOwner, tokenPriceInETH, amountOfTokensToSell, saleEnd, tokensUnlockTime, PORTION_VESTING_PRECISION, maxParticipation);
    }

    async function setRegistrationTime(params) {
        const blockTimestamp = await getCurrentBlockTimestamp();

        const registrationTimeStarts = blockTimestamp + firstOrDefault(params, 'registrationTimeStartsDelta', REGISTRATION_TIME_STARTS_DELTA);
        const registrationTimeEnds = blockTimestamp + firstOrDefault(params, 'registrationTimeEndsDelta', REGISTRATION_TIME_ENDS_DELTA);

        return C2NSale.setRegistrationTime(registrationTimeStarts, registrationTimeEnds);
    }

    async function setSaleStart(params) {
        const blockTimestamp = await getCurrentBlockTimestamp();
        const startTime = blockTimestamp + firstOrDefault(params, 'startTime', SALE_START_DELTA);
        return C2NSale.setSaleStart(startTime);
    }

    async function setVestingParams() {
        const blockTimestamp = await getCurrentBlockTimestamp();
        vestingPortionsUnlockTime = [blockTimestamp + 10, blockTimestamp + 20];
        vestingPercentPerPortion = [5, 95];
        await C2NSale.setVestingParams(vestingPortionsUnlockTime, vestingPercentPerPortion, 500000);
    }

    async function depositTokens() {
        await C2NToken.approve(C2NSale.address, AMOUNT_OF_TOKENS_TO_SELL);
        await C2NSale.depositTokens();
    }

    async function runFullSetupNoDeposit(params) {
        await setSaleParams(params);
        await setRegistrationTime(params);
        await setSaleStart(params);
    }

    async function runFullSetup(params) {
        await setSaleParams(params);
        await setRegistrationTime(params);
        await setSaleStart(params)
        await depositTokens();
    }

    async function registerForSale(params) {
        const registrant = firstOrDefault(params, 'sender', deployer);

        const sig = signRegistration(registrant.address, C2NSale.address, DEPLOYER_PRIVATE_KEY);

        await C2NSale.connect(registrant).registerForSale(sig, 0);
    }

    beforeEach(async function () {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        alice = accounts[1];
        bob = accounts[2];

        const BreTokenFactory = await ethers.getContractFactory("C2NToken");
        C2NToken = await BreTokenFactory.deploy("C2N", "C2N", ethers.utils.parseEther("1000000000"), DECIMALS);
        BobaToken = await BreTokenFactory.deploy("Boba", "BOBA", ethers.utils.parseEther("1000000000"), DECIMALS);

        const AdminFactory = await ethers.getContractFactory("Admin");
        Admin = await AdminFactory.deploy([deployer.address, alice.address, bob.address]);

        const SalesFactoryFactory = await ethers.getContractFactory("SalesFactory");
        SalesFactory = await SalesFactoryFactory.deploy(Admin.address, ZERO_ADDRESS);

        AllocationStakingRewardsFactory = await ethers.getContractFactory("AllocationStaking");
        const blockTimestamp = await getCurrentBlockTimestamp();
        startTimestamp = blockTimestamp + START_TIMESTAMP_DELTA;
        AllocationStaking = await AllocationStakingRewardsFactory.deploy();
        await AllocationStaking.initialize(C2NToken.address, REWARDS_PER_SECOND, startTimestamp, SalesFactory.address,);

        await AllocationStaking.add(1, C2NToken.address, false);
        await AllocationStaking.add(1, BobaToken.address, false);
        await SalesFactory.setAllocationStaking(AllocationStaking.address);

        await SalesFactory.deploySale();
        const C2NSaleFactory = await ethers.getContractFactory("C2NSale");
        C2NSale = C2NSaleFactory.attach(await SalesFactory.allSales(0));
    })


    context("setup", async function () {
        it('should  setup the token correctly', async function () {
            // Given
            let admin = await C2NSale.admin();

            // Then
            expect(admin).to.equal(Admin.address);
        });

        describe("Set sale parameters", async function () {
            it("Should set the sale parameters", async function () {

                // Given
                const blockTimestamp = (await ethers.provider.getBlock('latest')).timestamp;
                const token = C2NToken.address;
                const saleOwner = deployer.address;
                const tokenPriceInETH = TOKEN_PRICE_IN_ETH;
                const amountOfTokensToSell = AMOUNT_OF_TOKENS_TO_SELL;
                const saleEnd = blockTimestamp + SALE_END_DELTA;
                const tokensUnlockTime = blockTimestamp + TOKENS_UNLOCK_TIME_DELTA;


                // When
                await C2NSale.setSaleParams(token, saleOwner, tokenPriceInETH, amountOfTokensToSell, saleEnd, tokensUnlockTime, PORTION_VESTING_PRECISION, MAX_PARTICIPATION);

                // Then
                const sale = await C2NSale.sale();
                expect(sale.token).to.equal(token);
                expect(sale.isCreated).to.be.true;
                expect(sale.saleOwner).to.equal(saleOwner);
                expect(sale.tokenPriceInETH).to.equal(tokenPriceInETH);
                expect(sale.amountOfTokensToSell).to.equal(amountOfTokensToSell);
                expect(sale.saleEnd).to.equal(saleEnd);
                expect(sale.tokensUnlockTime).to.equal(tokensUnlockTime);
                expect(sale.maxParticipation).to.equal(MAX_PARTICIPATION);

            })
            it("Should not allow non-admin to set sale parameters", async function () {
                // Given
                await Admin.removeAdmin(deployer.address);

                // Then
                await expect(setSaleParams()).to.be.revertedWith("Only admin can call this function.");
            });

            it("Should emit SaleCreated event when parameters are set", async function () {
                // Given
                const blockTimestamp = (await ethers.provider.getBlock('latest')).timestamp;
                const token = C2NToken.address;
                const saleOwner = deployer.address;
                const tokenPriceInETH = TOKEN_PRICE_IN_ETH;
                const amountOfTokensToSell = AMOUNT_OF_TOKENS_TO_SELL;
                const saleEnd = blockTimestamp + SALE_END_DELTA;
                const tokensUnlockTime = blockTimestamp + TOKENS_UNLOCK_TIME_DELTA;

                // When
                expect(await C2NSale.setSaleParams(token, saleOwner, tokenPriceInETH, amountOfTokensToSell, saleEnd, tokensUnlockTime, PORTION_VESTING_PRECISION, MAX_PARTICIPATION)).to.emit(C2NSale, "SaleCreated")
                    .withArgs(saleOwner, tokenPriceInETH, amountOfTokensToSell, saleEnd);
            });

            it("Should not set sale parameters if sale is already created", async function () {
                // Given
                await setSaleParams();

                // Then
                await expect(setSaleParams()).to.be.revertedWith("setSaleParams: Sale is already created.");
            });

            it("Should not set sale parameters if sale owner is the zero address", async function () {
                // Then
                await expect(setSaleParams({saleOwner: ZERO_ADDRESS})).to.be.revertedWith("setSaleParams: Sale owner address can not be 0.");
            });


            it("Should not set sale parameters if token price is 0", async function () {
                // Then
                await expect(setSaleParams({tokenPriceInETH: 0})).to.be.revertedWith("setSaleParams: Bad input");
            });

            it("Should not set sale parameters if token amount is 0", async function () {
                // Then
                await expect(setSaleParams({amountOfTokensToSell: 0})).to.be.revertedWith("setSaleParams: Bad input");
            });

            it("Should not set sale parameters if maxParticipation is 0", async function () {
                // Then
                await expect(setSaleParams({maxParticipation: 0})).to.be.revertedWith("setSaleParams: Bad input");
            });

            it("Should not set sale parameters if sale end date is in the past", async function () {
                // Then
                await expect(setSaleParams({saleEndDelta: -100})).to.be.revertedWith("setSaleParams: Bad input");
            });
        });

        describe("Set sale registration times", async function () {
            it("Should set the registration times", async function () {
                // Given
                await setSaleParams();
                const blockTimestamp = await getCurrentBlockTimestamp();

                const registrationTimeStarts = blockTimestamp + REGISTRATION_TIME_STARTS_DELTA;
                const registrationTimeEnds = blockTimestamp + REGISTRATION_TIME_ENDS_DELTA;

                // When
                await C2NSale.setRegistrationTime(registrationTimeStarts, registrationTimeEnds);

                // Then
                const registration = await C2NSale.registration();
                expect(registration.registrationTimeStarts).to.equal(registrationTimeStarts);
                expect(registration.registrationTimeEnds).to.equal(registrationTimeEnds);
            });

            it("Should not allow non-admin to set registration times", async function () {
                // Given
                await setSaleParams();
                await Admin.removeAdmin(deployer.address);

                // Then
                await expect(setRegistrationTime()).to.be.revertedWith("Only admin can call this function.");
            });

            it("Should emit RegistrationTimeSet when setting registration times", async function () {
                // Given
                await setSaleParams();
                const blockTimestamp = await getCurrentBlockTimestamp();

                const registrationTimeStarts = blockTimestamp + REGISTRATION_TIME_STARTS_DELTA;
                const registrationTimeEnds = blockTimestamp + REGISTRATION_TIME_ENDS_DELTA;

                // Then
                await expect(C2NSale.setRegistrationTime(registrationTimeStarts, registrationTimeEnds))
                    .to.emit(C2NSale, "RegistrationTimeSet")
                    .withArgs(registrationTimeStarts, registrationTimeEnds);
            });

            it("Should not set registration times twice", async function () {
                // Given
                await setSaleParams();
                await setRegistrationTime()

                // Then
                await expect(setRegistrationTime()).to.be.reverted;
            });

            it("Should not set registration times if registration start time is in the past", async function () {
                // Given
                await setSaleParams();

                // Then
                await expect(setRegistrationTime({registrationTimeStartsDelta: -100})).to.be.reverted;
            });

            it("Should not set registration times if registration end time is in the past", async function () {
                // Given
                await setSaleParams();

                // Then
                await expect(setRegistrationTime({registrationTimeEndsDelta: -100})).to.be.reverted;
            });

            it("Should not set registration times if registration end time is before start time", async function () {
                // Given
                await setSaleParams();

                // Then
                await expect(setRegistrationTime({
                    registrationTimeStartsDelta: 30, registrationTimeEndsDelta: 20
                })).to.be.reverted;
            });

            it("Should not set registration times if registration end time is equal to start time", async function () {
                // Given
                await setSaleParams();

                // Then
                await expect(setRegistrationTime({
                    registrationTimeStartsDelta: 30, registrationTimeEndsDelta: 30
                })).to.be.reverted;
            });

            it("Should not set registration times if sale not created", async function () {
                // Then
                await expect(setRegistrationTime()).to.be.reverted;
            });

            it("Should not set registration times beyond sale end", async function () {
                // Given
                await setSaleParams();

                // Then
                await expect(setRegistrationTime({
                    registrationTimeStartsDelta: 20, registrationTimeEndsDelta: SALE_END_DELTA + 100
                })).to.be.reverted;
            });

            it("Should not set registration times beyond sale start", async function () {
                // Given
                await setSaleParams();
                await setSaleStart();

                // Then
                await expect(setRegistrationTime({
                    registrationTimeStartsDelta: 1, registrationTimeEndsDelta: SALE_START_DELTA
                })).to.be.reverted;
            });
        });

        describe("Set sale startTime", async function () {
            it("Should set sale startTime", async function () {
                // Given
                const blockTimestamp = await getCurrentBlockTimestamp();
                const startTime = blockTimestamp + SALE_START_DELTA;
                await setSaleParams();

                // When
                await C2NSale.setSaleStart(startTime);

                // Then
                expect((await C2NSale.sale()).saleStart).to.equal(startTime);
            });

            it("Should not allow non-admin to set sale start", async function () {
                // Given
                await setSaleParams();
                await Admin.removeAdmin(deployer.address);

                // Then
                await expect(setSaleStart()).to.be.revertedWith("Only admin can call this function.");
            });

            it("Should not set sale start if saleStart are already set", async function () {
                // Given
                await setSaleParams();
                await setSaleStart();

                // Then
                await expect(setSaleStart()).to.be.revertedWith("setSaleStart: starTime is set already.");
            });

            it("Should not set sale start if start time are in the past", async function () {
                // Given
                await setSaleParams();

                // Then
                await expect(setSaleStart({startTime: -20})).to.be.revertedWith("start time should be in the future.");
            });

            it("Should not set sale start if start time is after sale end date", async function () {
                // Given
                await setSaleParams();

                // Then
                await expect(setSaleStart({startTime: SALE_END_DELTA})).to.be.revertedWith("start time should less than saleEnd time");
            });

            it("Should not set sale start to overlap with registration", async function () {
                // Given
                await setSaleParams();
                await setRegistrationTime();

                // Then
                await expect(setSaleStart({startTime: REGISTRATION_TIME_ENDS_DELTA - 10})).to.be.revertedWith("start time should greater than registrationTimeEnds.");
            });

            it("Should not set sale start if sale not created", async function () {
                // Then
                await expect(setSaleStart()).to.be.revertedWith("sale is not created.");
            });

            it("Should emit StartTimeSet event", async function () {
                // Given
                const blockTimestamp = await getCurrentBlockTimestamp();
                const startTime = blockTimestamp + 50;
                await setSaleParams();

                // Then
                await expect(C2NSale.setSaleStart(startTime))
                    .to.emit(C2NSale, "StartTimeSet")
                    .withArgs(startTime);
            });

            it("Should set sale token", async function () {
                // Given
                const BreTokenFactory = await ethers.getContractFactory("C2NToken");
                const BreToken2 = await BreTokenFactory.deploy("C2N", "C2N", ethers.utils.parseUnits("10000000000000000000000000"), 18);

                // When
                await C2NSale.setSaleToken(BreToken2.address);

                // Then
                const sale = await C2NSale.sale();
                expect(sale[0]).to.equal(BreToken2.address);
            });
        });
    });

    context("update", async function () {
        describe('Update token price', function () {
            it('should set the token price', async function () {
                // Given
                const price = 123;
                await runFullSetup();

                // When
                await C2NSale.updateTokenPriceInETH(price);

                // Then
                expect((await C2NSale.sale()).tokenPriceInETH).to.equal(price)
            });

            it("Should not allow non-admin to set token price", async function () {
                // Given
                const price = 123;
                await runFullSetup();
                await Admin.removeAdmin(deployer.address);

                // Then
                await expect(C2NSale.updateTokenPriceInETH(price)).to.be.revertedWith("Only admin can call this function.");
            });

            it("Should emit TokenPriceSet event", async function () {
                // Given
                const price = 123;
                await runFullSetup();

                // Then
                await expect(C2NSale.updateTokenPriceInETH(price))
                    .to.emit(C2NSale, "TokenPriceSet")
                    .withArgs(price);
            });

            it("Should not update token price to zero", async function () {
                // Given
                const price = 0;
                await runFullSetup();

                // Then
                await expect(C2NSale.updateTokenPriceInETH(price)).to.be.revertedWith("Price can not be 0.");
            });
        });

        describe("Postpone sale", async function () {
            it("Should postpone the sale", async function () {
                // Given
                const timeToShift = 2;
                await runFullSetup();
                const currentStart = parseInt((await C2NSale.sale()).saleStart)

                // When
                await C2NSale.postponeSale(timeToShift);

                // Then
                expect((await C2NSale.sale()).saleStart).to.equal(currentStart + timeToShift);
            });

            it("Should not allow non-admin to postpone sale", async function () {
                // Given
                const timeToShift = 10;
                await runFullSetup();
                await Admin.removeAdmin(deployer.address);

                // Then
                await expect(C2NSale.postponeSale(timeToShift)).to.be.revertedWith("Only admin can call this function.");
            });

            it("Should not postpone sale if sale already started", async function () {
                // Given
                const timeToShift = 10;
                await runFullSetup();

                // When
                await ethers.provider.send("evm_increaseTime", [SALE_START_DELTA]);
                await ethers.provider.send("evm_mine");

                // Then
                await expect(C2NSale.postponeSale(timeToShift)).to.be.revertedWith("sale already started.");
            });

            it("Should not postpone sale if sale start not set", async function () {
                // Given
                const timeToShift = 10;
                await setSaleParams();
                await setRegistrationTime();

                // Then
                await expect(C2NSale.postponeSale(timeToShift)).to.be.reverted;
            });
        });

        describe("Extend registration period", async function () {
            it("Should extend the registration period", async function () {
                // Given
                const timeToAdd = 10;
                await runFullSetup();
                const currentRegistrationEnd = parseInt((await C2NSale.registration()).registrationTimeEnds);

                // When
                await C2NSale.extendRegistrationPeriod(timeToAdd);

                // Then
                expect((await C2NSale.registration()).registrationTimeEnds).to.equal(currentRegistrationEnd + timeToAdd);
            });

            it("Should not allow non-admin to extend registration period", async function () {
                // Given
                const timeToAdd = 10;
                await runFullSetup();
                await Admin.removeAdmin(deployer.address);

                // Then
                await expect(C2NSale.extendRegistrationPeriod(timeToAdd)).to.be.revertedWith("Only admin can call this function.");
            });

            it("Should not extend registration to overlap sale start", async function () {
                // Given
                const timeToAdd = 60;
                await runFullSetup();
                const currentRegistrationEnd = parseInt((await C2NSale.registration()).registrationTimeEnds);

                // Then
                await expect(C2NSale.extendRegistrationPeriod(timeToAdd)).to.be.revertedWith("Registration period overflows sale start.");
            });
        });

        describe("Set max participation", async function () {
            it("Should set max participation", async function () {
                // Given
                const cap = 20;
                await runFullSetup();

                // When
                await C2NSale.setCap(cap);

                // Then
                expect((await C2NSale.sale()).maxParticipation).to.equal(20);
            });

            it("Should emit MaxParticipationSet", async function () {
                // Given
                const cap = 20;
                await runFullSetup();

                // Then
                await expect(C2NSale.setCap(cap)).to.emit(C2NSale, "MaxParticipationSet");
            });

            it("Should not allow non-admin to set max participation", async function () {
                // Given
                const cap = 20;
                await runFullSetup();
                await Admin.removeAdmin(deployer.address);

                // Then
                await expect(C2NSale.setCap(cap)).to.be.revertedWith("Only admin can call this function.");
            });

            it("Should not set max participation if sale already started", async function () {
                // Given
                const cap = 20;
                await runFullSetup();

                // When
                await ethers.provider.send("evm_increaseTime", [SALE_START_DELTA]);
                await ethers.provider.send("evm_mine");

                // Then
                await expect(C2NSale.setCap(cap)).to.be.revertedWith("sale already started.");
            });

            it("Should not set max participation to 0", async function () {
                // Given
                const cap = 0;
                await runFullSetup();

                // Then
                await expect(C2NSale.setCap(cap)).to.be.reverted;
            });
        });

        describe("Deposit tokens", async function () {
            it("Should allow sale owner to deposit tokens", async function () {
                // Given
                await runFullSetupNoDeposit();
                await C2NToken.approve(C2NSale.address, AMOUNT_OF_TOKENS_TO_SELL);

                // When
                await C2NSale.depositTokens();

                // Then
                const balance = await C2NToken.balanceOf(C2NSale.address);
                expect(balance).to.equal(AMOUNT_OF_TOKENS_TO_SELL);
            });

            it("Should not allow non-sale owner to deposit tokens", async function () {
                // Given
                await runFullSetupNoDeposit({saleOwner: bob.address});
                await C2NToken.approve(C2NSale.address, AMOUNT_OF_TOKENS_TO_SELL);

                // Then
                await expect(C2NSale.depositTokens()).to.be.revertedWith("OnlySaleOwner:: Restricted");
            });

            it("Should not deposit tokens twice", async function () {
                // Given
                await runFullSetupNoDeposit();
                await C2NToken.approve(C2NSale.address, AMOUNT_OF_TOKENS_TO_SELL);
                await C2NSale.depositTokens();

                // Then
                await expect(C2NSale.depositTokens()).to.be.revertedWith("Deposit can be done only once");
            });

        })
    })

    context("Registration", async function () {
        describe("Register for sale", async function () {
            it("Should register for sale", async function () {
                // Given
                await runFullSetup();
                expect((await C2NSale.registration()).numberOfRegistrants).to.equal(0);

                const sig = signRegistration(deployer.address, C2NSale.address, DEPLOYER_PRIVATE_KEY);

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                // When
                await C2NSale.registerForSale(sig, 0);

                // Then
                expect((await C2NSale.registration()).numberOfRegistrants).to.equal(1);
            });

            it("Should not register after registration ends", async function () {
                // Given
                await runFullSetup();
                expect((await C2NSale.registration()).numberOfRegistrants).to.equal(0);

                const sig = signRegistration(deployer.address, C2NSale.address, DEPLOYER_PRIVATE_KEY);

                // When
                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_ENDS_DELTA + 1]);
                await ethers.provider.send("evm_mine");

                // Then
                await expect(C2NSale.registerForSale(sig, 0))
                    .to.be.revertedWith("Registration gate is closed.");
            });

            it("Should not register before registration starts", async function () {
                // Given
                await runFullSetup();
                expect((await C2NSale.registration()).numberOfRegistrants).to.equal(0);

                const sig = signRegistration(deployer.address, C2NSale.address, DEPLOYER_PRIVATE_KEY);

                // Then
                await expect(C2NSale.registerForSale(sig, 0))
                    .to.be.revertedWith("Registration gate is closed.");
            });

            it("Should not register if signature invalid", async function () {
                // Given
                await runFullSetup();
                expect((await C2NSale.registration()).numberOfRegistrants).to.equal(0);

                const sig = signRegistration(alice.address, C2NSale.address, DEPLOYER_PRIVATE_KEY);

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                // Then
                await expect(C2NSale.registerForSale(sig, 0))
                    .to.be.revertedWith("Invalid signature");
            });

            it("Should not register twice", async function () {
                // Given
                await runFullSetup();
                expect((await C2NSale.registration()).numberOfRegistrants).to.equal(0);

                const sig = signRegistration(deployer.address, C2NSale.address, DEPLOYER_PRIVATE_KEY);

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await C2NSale.registerForSale(sig, 0);

                // Then
                await expect(C2NSale.registerForSale(sig, 0))
                    .to.be.revertedWith("User can not register twice.");
            });

            it("Should emit UserRegistered event", async function () {
                // Given
                await runFullSetup();
                expect((await C2NSale.registration()).numberOfRegistrants).to.equal(0);

                const sig = signRegistration(deployer.address, C2NSale.address, DEPLOYER_PRIVATE_KEY);

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                // Then
                await expect(C2NSale.registerForSale(sig, 0))
                    .to.emit(C2NSale, "UserRegistered").withArgs(deployer.address);
            });
        });

        // Deprecated getter function tests
        xdescribe("Get registration info", async function () {
            it("Should return registration info when sale not set", async function () {
                // When
                const regInfo = await C2NSale.getRegistrationInfo();

                // Then
                expect(regInfo[0]).to.equal(0);
                expect(regInfo[1]).to.equal(0);
            });

            it("Should return initial registration info", async function () {
                // Given
                const blockTimestamp = getCurrentBlockTimestamp();
                await runFullSetup();

                // When
                const regInfo = await C2NSale.getRegistrationInfo();

                // Then
                const registrationTimeEnds = (await C2NSale.registration()).registrationTimeEnds;
                expect(regInfo[0]).to.equal(registrationTimeEnds);
                expect(regInfo[1]).to.equal(0);
            });

            it("Should return updated registration info after users registered", async function () {
                // Given
                await runFullSetup();
                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                // When
                await registerForSale();

                // Then
                const regInfo = await C2NSale.getRegistrationInfo();
                expect(regInfo[1]).to.equal(1);
            });

            it("Should return updated registration info after registration extended", async function () {
                // Given
                await runFullSetup();

                // When
                const timeToAdd = 10;
                await C2NSale.extendRegistrationPeriod(timeToAdd);

                // Then
                const regInfo = await C2NSale.getRegistrationInfo();
                const registrationTimeEnds = (await C2NSale.registration()).registrationTimeEnds;
                expect(regInfo[0]).to.equal(registrationTimeEnds);
            });
        });
    });

    context("Signature validation", async function () {
        describe("Check registration signature", async function () {
            it("Should succeed for valid signature", async function () {
                // Given
                const sig = signRegistration(deployer.address, C2NSale.address, DEPLOYER_PRIVATE_KEY);

                // Then
                expect(await C2NSale.checkRegistrationSignature(sig, deployer.address)).to.be.true;
            });

            it("Should fail if signature is for a different user", async function () {
                // Given
                const sig = signRegistration(alice.address, C2NSale.address, DEPLOYER_PRIVATE_KEY);

                // Then
                expect(await C2NSale.checkRegistrationSignature(sig, deployer.address)).to.be.false;
            });

            it("Should fail if signature is for a different contract", async function () {
                // Given
                const sig = signRegistration(deployer.address, C2NToken.address, DEPLOYER_PRIVATE_KEY);

                // Then
                expect(await C2NSale.checkRegistrationSignature(sig, deployer.address)).to.be.false;
            });

            it("Should revert if signature has wrong length", async function () {
                // Given
                const sig = signRegistration(deployer.address, C2NSale.address, DEPLOYER_PRIVATE_KEY);

                // Then
                await expect(C2NSale.checkRegistrationSignature(sig.slice(1), deployer.address)).to.be.revertedWith("ECDSA: invalid signature length");
            });

            it("Should revert if signature has wrong format", async function () {
                // Given
                const sig = Buffer.alloc(32 + 32 + 1);

                // Then
                await expect(C2NSale.checkRegistrationSignature(sig, deployer.address)).to.be.revertedWith("ECDSA: invalid signature 'v' value");
            });

            it("Should fail if signer is sale owner and not admin", async function () {
                // Given
                await runFullSetup();
                await Admin.removeAdmin(deployer.address);
                const sig = signRegistration(deployer.address, C2NSale.address, DEPLOYER_PRIVATE_KEY);

                // Then
                expect(await C2NSale.checkRegistrationSignature(sig, deployer.address)).to.be.false;
            });

            it("Should fail if signer is neither sale owner nor admin", async function () {
                // Given
                await runFullSetupNoDeposit({saleOwner: alice.address});
                await Admin.removeAdmin(deployer.address);
                const sig = signRegistration(deployer.address, C2NSale.address, DEPLOYER_PRIVATE_KEY);

                // Then
                expect(await C2NSale.checkRegistrationSignature(sig, deployer.address)).to.be.false;
            });

            it("Should fail if signature is applied to hash instead of prefixed EthereumSignedMessage hash", async function () {
                // Given
                const digest = ethers.utils.keccak256(ethers.utils.solidityPack(['address', 'address'], [deployer.address, C2NSale.address]));
                const {v, r, s} = ethUtil.ecsign(ethUtil.toBuffer(digest), Buffer.from(DEPLOYER_PRIVATE_KEY, 'hex'))
                const vb = Buffer.from([v]);
                const sig = Buffer.concat([r, s, vb]);

                // Then
                expect(await C2NSale.checkRegistrationSignature(sig, deployer.address)).to.be.false;
            });
        });

        describe("Check participation signature", async function () {
            it("Should succeed for valid signature", async function () {
                // Given
                const sig = signParticipation(deployer.address, 100, C2NSale.address, DEPLOYER_PRIVATE_KEY);

                // Then
                expect(await C2NSale.checkParticipationSignature(sig, deployer.address, 100)).to.be.true;
            });

            it("Should fail if signature is for a different user", async function () {
                // Given
                const sig = signParticipation(alice.address, 100, C2NSale.address, DEPLOYER_PRIVATE_KEY);

                // Then
                expect(await C2NSale.checkParticipationSignature(sig, deployer.address, 100)).to.be.false;
            });

            it("Should fail if signature is for a different amount", async function () {
                // Given
                const sig = signParticipation(deployer.address, 200, C2NSale.address, DEPLOYER_PRIVATE_KEY);

                // Then
                expect(await C2NSale.checkParticipationSignature(sig, deployer.address, 100)).to.be.false;
            });

            it("Should fail if signature is for a different contract", async function () {
                // Given
                const sig = signParticipation(deployer.address, 100, C2NToken.address, DEPLOYER_PRIVATE_KEY);

                // Then
                expect(await C2NSale.checkParticipationSignature(sig, deployer.address, 100)).to.be.false;
            });

            it("Should revert if signature has wrong length", async function () {
                // Given
                const sig = signParticipation(deployer.address, 100, C2NSale.address, DEPLOYER_PRIVATE_KEY);

                // Then
                await expect(C2NSale.checkParticipationSignature(sig.slice(1), deployer.address, 100)).to.be.revertedWith("ECDSA: invalid signature length");
            });

            it("Should revert if signature has wrong format", async function () {
                // Given
                const sig = Buffer.alloc(32 + 32 + 1);

                // Then
                await expect(C2NSale.checkParticipationSignature(sig, deployer.address, 100)).to.be.revertedWith("ECDSA: invalid signature 'v' value");
            });

            it("Should fail if signer is sale owner and not admin", async function () {
                // Given
                await runFullSetup();
                await Admin.removeAdmin(deployer.address);
                const sig = signParticipation(deployer.address, 100, C2NSale.address, DEPLOYER_PRIVATE_KEY);

                // Then
                expect(await C2NSale.checkParticipationSignature(sig, deployer.address, 100)).to.be.false;
            });

            it("Should fail if signer is neither sale owner nor admin", async function () {
                // Given
                await runFullSetupNoDeposit({saleOwner: alice.address});
                await Admin.removeAdmin(deployer.address);
                const sig = signParticipation(deployer.address, 100, C2NSale.address, DEPLOYER_PRIVATE_KEY);

                // Then
                expect(await C2NSale.checkParticipationSignature(sig, deployer.address, 100)).to.be.false;
            });

            it("Should fail if signature is applied to hash instead of prefixed EthereumSignedMessage hash", async function () {
                // Given
                const digest = ethers.utils.keccak256(ethers.utils.solidityPack(['address', 'uint256'], [deployer.address, 100]));
                const {v, r, s} = ethUtil.ecsign(ethUtil.toBuffer(digest), Buffer.from(DEPLOYER_PRIVATE_KEY, 'hex'))
                const vb = Buffer.from([v]);
                const sig = Buffer.concat([r, s, vb]);

                // Then
                expect(await C2NSale.checkParticipationSignature(sig, deployer.address, 100)).to.be.false;
            });
        });
    });

    context("Participation", async function () {
        describe("Participate", async function () {
            it("Should allow user to participate", async function () {
                // Given
                await runFullSetup();

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await registerForSale();

                await ethers.provider.send("evm_increaseTime", [SALE_START_DELTA - REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await C2NToken.approve(AllocationStaking.address, "50000000");
                await AllocationStaking.deposit(0, "50000000");

                // When
                await participate();

                // Then
                const sale = await C2NSale.sale();
                const isParticipated = await C2NSale.isParticipated(deployer.address);
                const participation = await C2NSale.getParticipation(deployer.address);

                expect(sale.totalTokensSold).to.equal(PARTICIPATION_VALUE.div(TOKEN_PRICE_IN_ETH).mul(MULTIPLIER));
                expect(sale.totalETHRaised).to.equal(PARTICIPATION_VALUE);
                expect(isParticipated).to.be.true;
                expect(participation[0]).to.equal(PARTICIPATION_VALUE.div(TOKEN_PRICE_IN_ETH).mul(MULTIPLIER));

                expect(await C2NSale.getNumberOfRegisteredUsers()).to.equal(1);
            });

            it("Should allow multiple users to participate", async function () {
                // Given
                await runFullSetup();

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await registerForSale();
                await registerForSale({sender: alice});

                await ethers.provider.send("evm_increaseTime", [SALE_START_DELTA - REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                // When
                await participate();
                await participate({sender: alice});

                // Then
                const sale = await C2NSale.sale();
                const isParticipatedDeployer = await C2NSale.isParticipated(deployer.address);
                const isParticipatedAlice = await C2NSale.isParticipated(alice.address);
                const participationDeployer = await C2NSale.userToParticipation(deployer.address);
                const participationAlice = await C2NSale.userToParticipation(alice.address);

                expect(sale.totalTokensSold).to.equal(PARTICIPATION_VALUE.mul(2).div(TOKEN_PRICE_IN_ETH).mul(MULTIPLIER));
                expect(sale.totalETHRaised).to.equal(BigNumber.from(PARTICIPATION_VALUE).mul(2));
                expect(isParticipatedDeployer).to.be.true;
                expect(isParticipatedAlice).to.be.true;
                // todo buy token price?
                expect(participationDeployer.amountBought).to.equal(PARTICIPATION_VALUE.div(TOKEN_PRICE_IN_ETH).mul(MULTIPLIER));
                expect(participationAlice.amountBought).to.equal(PARTICIPATION_VALUE.div(TOKEN_PRICE_IN_ETH).mul(MULTIPLIER));
            });

            it("Should not participate with amount larger than maxParticipation", async function () {
                // Given
                await runFullSetup();

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await registerForSale();

                await ethers.provider.send("evm_increaseTime", [SALE_START_DELTA - REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                // Then
                await expect(participate({participationAmount: MAX_PARTICIPATION + 1}))
                    .to.be.revertedWith("Overflowing maximal participation for sale.");
            });

            it("Should not participate with invalid signature", async function () {
                // Given
                await runFullSetup();

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await registerForSale();

                await ethers.provider.send("evm_increaseTime", [SALE_START_DELTA - REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                // When
                const sig = signParticipation(alice.address, PARTICIPATION_AMOUNT, C2NSale.address, DEPLOYER_PRIVATE_KEY);

                // Then
                await expect(C2NSale.participate(sig, PARTICIPATION_AMOUNT, {value: PARTICIPATION_VALUE}))
                    .to.be.revertedWith("Invalid signature. Verification failed");
            })

            it("Should not participate twice", async function () {
                // Given
                await runFullSetup();

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await registerForSale();

                await ethers.provider.send("evm_increaseTime", [SALE_START_DELTA - REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await participate();

                // Then
                await expect(participate())
                    .to.be.revertedWith("User can participate only once.");
            });

            it("Should not participate in a sale that ended", async function () {
                // Given
                await runFullSetup();

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await registerForSale();

                await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA]);
                await ethers.provider.send("evm_mine");

                // Then
                await expect(participate())
                    .to.be.revertedWith("sale didn't start or it's ended.");
            });

            it("Should not participate in a round that has not started", async function () {
                // Given
                await runFullSetup();

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await registerForSale();

                // Then
                await expect(participate())
                    .to.be.revertedWith("sale didn't start or it's ended.");
            });

            it("Should not buy more than allowed", async function () {
                // Given
                await runFullSetup();

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await registerForSale();

                await ethers.provider.send("evm_increaseTime", [SALE_START_DELTA - REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                // Then
                await expect(participate({participationValue: (PARTICIPATION_VALUE.add(1))})).to.be.revertedWith("Trying to buy more than allowed.");
            });

            it("Should emit TokensSold event", async function () {
                // Given
                await runFullSetup();

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await registerForSale();

                await ethers.provider.send("evm_increaseTime", [SALE_START_DELTA - REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                // Then
                await expect(participate()).to.emit(C2NSale, "TokensSold").withArgs(deployer.address, PARTICIPATION_VALUE.div(TOKEN_PRICE_IN_ETH).mul(MULTIPLIER));
            });

            it("Should not participate without registering for the round", async function () {
                // Given
                await runFullSetup();

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await ethers.provider.send("evm_increaseTime", [SALE_START_DELTA - REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                // Then
                await expect(participate()).to.be.revertedWith("Not registered for this sale.");
            });

            it("Should fail if buying 0 tokens", async function () {
                // Given
                await runFullSetup();

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await registerForSale();

                await ethers.provider.send("evm_increaseTime", [SALE_START_DELTA - REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                // Then
                await expect(participate({participationValue: 0})).to.be.reverted;
            });
        });

        describe("Withdraw tokens", async function () {
            it("Should withdraw user's tokens", async function () {
                // Given
                await runFullSetup();

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await registerForSale();
                await setVestingParams();

                const vestingParams = await C2NSale.getVestingInfo();
                expect(vestingParams[0][0]).to.equal(vestingPortionsUnlockTime[0]);
                expect(vestingParams[0][1]).to.equal(vestingPortionsUnlockTime[1]);
                expect(vestingParams[1][0]).to.equal(vestingPercentPerPortion[0]);
                expect(vestingParams[1][1]).to.equal(vestingPercentPerPortion[1]);

                await ethers.provider.send("evm_increaseTime", [SALE_START_DELTA - REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await participate();

                await ethers.provider.send("evm_increaseTime", [TOKENS_UNLOCK_TIME_DELTA - SALE_START_DELTA]);
                await ethers.provider.send("evm_mine");

                // console.log(await C2NSale.getParticipation(deployer.address));

                await C2NToken.transfer(C2NSale.address, "10000000000000000000");
                const previousBalance = BigNumber.from(await C2NToken.balanceOf(deployer.address));
                // console.log(previousBalance)

                // When
                await C2NSale.withdrawTokens(0);

                // Then
                const currentBalance = BigNumber.from(await C2NToken.balanceOf(deployer.address));
                // console.log(currentBalance)
                const withdrawAmount = PARTICIPATION_VALUE.mul(MULTIPLIER).div(TOKEN_PRICE_IN_ETH).mul(5).div(PORTION_VESTING_PRECISION);
                // console.log(withdrawAmount)
                expect(currentBalance).to.equal(previousBalance.add(withdrawAmount));
            });

            it("Should withdraw user's tokens using multiple portion withdrawal", async function () {
                // Given
                await runFullSetup();

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await registerForSale();
                await setVestingParams();

                const vestingParams = await C2NSale.getVestingInfo();
                expect(vestingParams[0][0]).to.equal(vestingPortionsUnlockTime[0]);
                expect(vestingParams[0][1]).to.equal(vestingPortionsUnlockTime[1]);
                expect(vestingParams[1][0]).to.equal(vestingPercentPerPortion[0]);
                expect(vestingParams[1][1]).to.equal(vestingPercentPerPortion[1]);

                await ethers.provider.send("evm_increaseTime", [SALE_START_DELTA - REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await participate();

                await ethers.provider.send("evm_increaseTime", [TOKENS_UNLOCK_TIME_DELTA - SALE_START_DELTA]);
                await ethers.provider.send("evm_mine");

                // console.log(await C2NSale.getParticipation(deployer.address));

                await C2NToken.transfer(C2NSale.address, "10000000000000000000");
                const previousBalance = BigNumber.from(await C2NToken.balanceOf(deployer.address));

                // When
                await C2NSale.withdrawMultiplePortions([0, 1]);

                // Then
                const currentBalance = BigNumber.from(await C2NToken.balanceOf(deployer.address));
                // console.log(parseInt(currentBalance))
                const withdrawAmount = PARTICIPATION_VALUE.div(TOKEN_PRICE_IN_ETH).mul(100).div(PORTION_VESTING_PRECISION).mul(MULTIPLIER);
                // console.log(withdrawAmount)
                expect(currentBalance).to.equal(previousBalance.add(withdrawAmount));
            })

            it("Should not withdraw twice", async function () {
                // Given
                await runFullSetup();

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await registerForSale();
                await setVestingParams();

                await ethers.provider.send("evm_increaseTime", [SALE_START_DELTA - REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await participate();

                await ethers.provider.send("evm_increaseTime", [TOKENS_UNLOCK_TIME_DELTA - SALE_START_DELTA]);
                await ethers.provider.send("evm_mine");

                await C2NToken.transfer(C2NSale.address, "10000000000000000000");
                await C2NSale.withdrawTokens(0);

                // Then
                await expect(C2NSale.withdrawTokens(0)).to.be.revertedWith("Tokens already withdrawn or portion not unlocked yet.");
            });

            it("Should not withdraw before tokens unlock time", async function () {
                // Given
                await runFullSetup();

                await setVestingParams();
                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await registerForSale();

                await ethers.provider.send("evm_increaseTime", [SALE_START_DELTA - REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await participate();

                // Then
                await expect(C2NSale.withdrawTokens(0)).to.be.revertedWith("Tokens can not be withdrawn yet.");
            });

            it("Should emit TokensWithdrawn event", async function () {
                // Given
                await runFullSetup();

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await registerForSale();
                await setVestingParams();

                await ethers.provider.send("evm_increaseTime", [SALE_START_DELTA - REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await participate();
                await C2NToken.transfer(C2NSale.address, "10000000000000000000");

                await ethers.provider.send("evm_increaseTime", [TOKENS_UNLOCK_TIME_DELTA - SALE_START_DELTA]);
                await ethers.provider.send("evm_mine");

                // Then
                await expect(C2NSale.withdrawTokens(0)).to.emit(C2NSale, "TokensWithdrawn").withArgs(deployer.address, PARTICIPATION_VALUE.div(TOKEN_PRICE_IN_ETH).mul(5).div(PORTION_VESTING_PRECISION).mul(MULTIPLIER));
            });

            it("Should shift westing unclock times", async function () {
                // Given
                await runFullSetup();

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await registerForSale();
                await setVestingParams();

                const shift = 10;
                await C2NSale.shiftVestingUnlockingTimes(shift);

                const vestingParams = await C2NSale.getVestingInfo();
                expect(vestingParams[0][0]).to.equal(vestingPortionsUnlockTime[0] + shift);
                expect(vestingParams[0][1]).to.equal(vestingPortionsUnlockTime[1] + shift);
            });
        });

        describe("Withdraw earnings and leftover", async function () {
            xit("Should withdraw sale owner's earnings and leftovers", async function () {
                // Given
                await runFullSetup();

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await registerForSale({sender: alice});

                await ethers.provider.send("evm_increaseTime", [SALE_START_DELTA - REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await participate({sender: alice});

                await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA - SALE_START_DELTA]);
                await ethers.provider.send("evm_mine");

                const previousBalance = await ethers.provider.getBalance(deployer.address);
                const previousTokenBalance = await C2NToken.balanceOf(deployer.address);

                const sale = await C2NSale.sale();
                console.log(parseInt(sale.amountOfTokensToSell), parseInt(sale.totalTokensSold));

                await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA]);
                await ethers.provider.send("evm_mine");

                // When
                await C2NSale.withdrawEarningsAndLeftover();

                // Then
                const currentBalance = await ethers.provider.getBalance(deployer.address);
                const contractBalance = await ethers.provider.getBalance(C2NSale.address);
                const currentTokenBalance = await C2NToken.balanceOf(deployer.address);
                const contractTokenBalance = await C2NToken.balanceOf(C2NSale.address);

                expect(currentBalance).to.equal(previousBalance.add(PARTICIPATION_VALUE));
                expect(currentTokenBalance).to.equal(previousTokenBalance.add((AMOUNT_OF_TOKENS_TO_SELL - PARTICIPATION_VALUE / TOKEN_PRICE_IN_ETH)));
                expect(contractBalance).to.equal(0);
                expect(contractTokenBalance).to.equal(PARTICIPATION_VALUE / TOKEN_PRICE_IN_ETH);
            });

            it("Should not withdraw twice", async function () {
                // Given
                await runFullSetup();

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await registerForSale({sender: alice});

                await ethers.provider.send("evm_increaseTime", [SALE_START_DELTA - REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await participate({sender: alice});

                await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA - SALE_START_DELTA]);
                await ethers.provider.send("evm_mine");

                await C2NSale.withdrawEarningsAndLeftover();

                // Then
                await expect(C2NSale.withdrawEarningsAndLeftover()).to.be.reverted;
            });

            it("Should not withdraw before sale ended", async function () {
                // Given
                await runFullSetup();

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await registerForSale({sender: alice});

                await ethers.provider.send("evm_increaseTime", [SALE_START_DELTA - REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await participate({sender: alice});

                await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA - SALE_START_DELTA - 15]);
                await ethers.provider.send("evm_mine");

                // Then
                await expect(C2NSale.withdrawEarningsAndLeftover()).to.be.reverted;
            });

            it("Should not allow non-sale owner to withdraw", async function () {
                // Given
                await runFullSetup();

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await registerForSale({sender: alice});

                await ethers.provider.send("evm_increaseTime", [SALE_START_DELTA - REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await participate({sender: alice});

                await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA - SALE_START_DELTA]);
                await ethers.provider.send("evm_mine");

                // Then
                await expect(C2NSale.connect(bob).withdrawEarningsAndLeftover()).to.be.revertedWith("OnlySaleOwner:: Restricted");
            });

            //TODO:
            xit("Should burn leftover if requested", async function () {
                // Given
                await runFullSetup();

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await registerForSale({sender: alice});

                await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0] - REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await participate({sender: alice});

                await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA - ROUNDS_START_DELTAS[0]]);
                await ethers.provider.send("evm_mine");

                const previousBalance = await ethers.provider.getBalance(deployer.address);
                const previousTokenBalance = await C2NToken.balanceOf(deployer.address);

                // When
                await C2NSale.withdrawEarningsAndLeftover();

                // Then
                const currentBalance = await ethers.provider.getBalance(deployer.address);
                const contractBalance = await ethers.provider.getBalance(C2NSale.address);
                const currentTokenBalance = await C2NToken.balanceOf(deployer.address);
                const contractTokenBalance = await C2NToken.balanceOf(C2NSale.address);
                const burnedTokenBalance = await C2NToken.balanceOf(ONE_ADDRESS);

                expect(currentBalance).to.equal(previousBalance.add(PARTICIPATION_VALUE));
                expect(currentTokenBalance).to.equal(previousTokenBalance);
                expect(contractBalance).to.equal(0);
                expect(contractTokenBalance).to.equal(PARTICIPATION_VALUE / TOKEN_PRICE_IN_ETH);
                expect(burnedTokenBalance).to.equal(AMOUNT_OF_TOKENS_TO_SELL - PARTICIPATION_VALUE / TOKEN_PRICE_IN_ETH);
            });

            //TODO:
            xit("Should not crash if leftover is 0", async function () {
                // Given
                await runFullSetup({amountOfTokensToSell: Math.floor(PARTICIPATION_VALUE / TOKEN_PRICE_IN_ETH * MULTIPLIER)});

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await registerForSale({sender: alice});

                await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0] - REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await participate({sender: alice});

                await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA - ROUNDS_START_DELTAS[0]]);
                await ethers.provider.send("evm_mine");

                const previousBalance = await ethers.provider.getBalance(deployer.address);
                const previousTokenBalance = await C2NToken.balanceOf(deployer.address);

                // When
                await C2NSale.withdrawEarningsAndLeftover();

                // Then
                const currentBalance = await ethers.provider.getBalance(deployer.address);
                const contractBalance = await ethers.provider.getBalance(C2NSale.address);
                const currentTokenBalance = await C2NToken.balanceOf(deployer.address);
                const contractTokenBalance = await C2NToken.balanceOf(C2NSale.address);

                expect(currentBalance).to.equal(previousBalance.add(PARTICIPATION_VALUE));
                expect(currentTokenBalance).to.equal(previousTokenBalance);
                expect(contractBalance).to.equal(0);
                expect(contractTokenBalance).to.equal(PARTICIPATION_VALUE / TOKEN_PRICE_IN_ETH * MULTIPLIER);
            });

            //TODO:
            xit("Should not crash if leftover is 0 and burn is requested", async function () {
                // Given
                await runFullSetup({amountOfTokensToSell: Math.floor(PARTICIPATION_VALUE / TOKEN_PRICE_IN_ETH * MULTIPLIER)});

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await registerForSale({sender: alice});

                await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0] - REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await participate({sender: alice});

                await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA - ROUNDS_START_DELTAS[0]]);
                await ethers.provider.send("evm_mine");

                const previousBalance = await ethers.provider.getBalance(deployer.address);
                const previousTokenBalance = await C2NToken.balanceOf(deployer.address);

                // When
                await C2NSale.withdrawEarningsAndLeftover();

                // Then
                const currentBalance = await ethers.provider.getBalance(deployer.address);
                const contractBalance = await ethers.provider.getBalance(C2NSale.address);
                const currentTokenBalance = await C2NToken.balanceOf(deployer.address);
                const contractTokenBalance = await C2NToken.balanceOf(C2NSale.address);
                const burnedTokenBalance = await C2NToken.balanceOf(ONE_ADDRESS);

                expect(currentBalance).to.equal(previousBalance.add(PARTICIPATION_VALUE));
                expect(currentTokenBalance).to.equal(previousTokenBalance);
                expect(contractBalance).to.equal(0);
                expect(contractTokenBalance).to.equal(PARTICIPATION_VALUE / TOKEN_PRICE_IN_ETH * MULTIPLIER);
                expect(burnedTokenBalance).to.equal(0);
            });

            //TODO:
            xit("Should not crash if earnings are 0", async function () {
                // Given
                await runFullSetup();

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0] - REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA - ROUNDS_START_DELTAS[0]]);
                await ethers.provider.send("evm_mine");

                const previousBalance = await ethers.provider.getBalance(deployer.address);
                const previousTokenBalance = await C2NToken.balanceOf(deployer.address);

                // When
                await C2NSale.withdrawEarningsAndLeftover();

                // Then
                const currentBalance = await ethers.provider.getBalance(deployer.address);
                const contractBalance = await ethers.provider.getBalance(C2NSale.address);
                const currentTokenBalance = await C2NToken.balanceOf(deployer.address);
                const contractTokenBalance = await C2NToken.balanceOf(C2NSale.address);

                expect(currentBalance).to.equal(previousBalance);
                expect(currentTokenBalance).to.equal(previousTokenBalance.add(AMOUNT_OF_TOKENS_TO_SELL));
                expect(contractBalance).to.equal(0);
                expect(contractTokenBalance).to.equal(0);
            });

            //TODO:
            xit("Should not crash if earnings are 0 and burn is requested", async function () {
                // Given
                await runFullSetup();

                await ethers.provider.send("evm_increaseTime", [REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0] - REGISTRATION_TIME_STARTS_DELTA]);
                await ethers.provider.send("evm_mine");

                await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA - ROUNDS_START_DELTAS[0]]);
                await ethers.provider.send("evm_mine");

                const previousBalance = await ethers.provider.getBalance(deployer.address);
                const previousTokenBalance = await C2NToken.balanceOf(deployer.address);

                // When
                await C2NSale.withdrawEarningsAndLeftover();

                // Then
                const currentBalance = await ethers.provider.getBalance(deployer.address);
                const contractBalance = await ethers.provider.getBalance(C2NSale.address);
                const currentTokenBalance = await C2NToken.balanceOf(deployer.address);
                const contractTokenBalance = await C2NToken.balanceOf(C2NSale.address);
                const burnedTokenBalance = await C2NToken.balanceOf(ONE_ADDRESS);

                expect(currentBalance).to.equal(previousBalance);
                expect(currentTokenBalance).to.equal(previousTokenBalance);
                expect(contractBalance).to.equal(0);
                expect(contractTokenBalance).to.equal(0);
                expect(burnedTokenBalance).to.equal(AMOUNT_OF_TOKENS_TO_SELL);
            });
        });

    });
});
