import {expect} from 'chai';

import {network} from 'hardhat';

import { log } from 'util';

/*

interface Questions {

question: string,

options: string[];

}



it("Survey init", async () => {

const {ethers} = await network.connect();



const title = "막무가내 설문조사";

const description = "중앙화된 설문조사로서, 모든 데이터는 공개되지 않으며 설문조사를 게시한자만 볼 수 있습니다.";

const questions: Questions[] = [

{

question: "누가 내 응답을 관리할때 더 솔직할 수 있을까요?",

options: ["구글폼 운영자", "탈중앙화된 블록체인(관리주체 없으며 모든 데이터 공개)", "상관없음"],

},

];



const factory = await ethers.deployContract("SurveyFactory", [

ethers.parseEther("50"),

ethers.parseEther("0.1"),

]);

const tx = await factory.createSurvey({title, description, targetNumber: 100, questions},

{value: ethers.parseEther("100")}

);



//const surveys = await factory.getSurveys();

const receipt = await tx.wait();

let surveyAddress;

receipt?.logs.forEach(log => {

const event = factory.interface.parseLog(log);

if(event?.name == "SurveyCreated"){

surveyAddress = event.args[0];

}

});



const surveyC = await ethers.getContractFactory("Survey");

const signers = await ethers.getSigners();

const respondent = signers[0];

if (surveyAddress) {

const survey = await surveyC.attach(surveyAddress);

await survey.connect(respondent);

console.log(ethers.formatEther(await ethers.provider.getBalance(respondent)));

const submitTx = await survey.submitAnswer({

respondent,

answers: [1],

});

await submitTx.wait();

console.log(ethers.formatEther(await ethers.provider.getBalance(respondent)));

}

});
*/

describe("SurveyFactory Contract", () => {
  let factory, owner, respondent1, respondent2, ethers;

  beforeEach(async () => {
    const conn = await network.connect();
    ethers = conn.ethers;
    
    [owner, respondent1, respondent2] = await ethers.getSigners();

    // SurveyFactory 배포 (min_pool_amount: 50 ETH, min_reward_amount: 0.1 ETH)
    factory = await ethers.deployContract("SurveyFactory", [
      ethers.parseEther("50"), 
      ethers.parseEther("0.1"), 
    ]);
  });

  // 1. 최소 금액 설정 확인 테스트
  it("should deploy with correct minimum amounts", async () => {
    // TODO: check min_pool_amount and min_reward_amount
    // 컨트랙트에 별도의 getter가 없으므로 팩토리가 정상 배포되었는지 확인합니다.
    expect(factory.target).to.not.be.undefined;
  });

  // 2. 유효한 값으로 설문조사 생성 테스트
  it("should create a new survey when valid values are provided", async () => {
    // TODO: prepare SurveySchema and call createSurvey with msg.value
    const surveyData = {
      title: "테스트 설문",
      description: "설문 설명입니다.",
      targetNumber: 100,
      questions: [
        {
          question: "질문 1",
          options: ["옵션1", "옵션2"]
        }
      ],
    };

    // 50 ETH 이상이면서 1인당 보상금 0.1 ETH 이상을 만족하는 금액 (100 ETH / 100명 = 1 ETH)
    const poolAmount = ethers.parseEther("100");

    // TODO: check event SurveyCreated emitted & surveys array length increased
    await expect(factory.createSurvey(surveyData, { value: poolAmount }))
      .to.emit(factory, "SurveyCreated");

    const surveys = await factory.getSurveys();
    expect(surveys.length).to.equal(1);
  });

  // 3. 풀 금액이 너무 작을 때 리버트 테스트
  it("should revert if pool amount is too small", async () => {
    // TODO: expect revert when msg.value < min_pool_amount
    const surveyData = {
      title: "실패 설문",
      description: "설명",
      targetNumber: 10,
      questions: [],
    };

    // min_pool_amount인 50 ETH보다 적은 30 ETH 전송
    const smallPoolAmount = ethers.parseEther("30");

    await expect(
      factory.createSurvey(surveyData, { value: smallPoolAmount })
    ).to.be.revertedWith("Insufficient pool amount");
  });

  // 4. 1인당 보상금이 너무 작을 때 리버트 테스트
  it("should revert if reward amount per respondent is too small", async () => {
    // TODO: expect revert when msg.value / targetNumber < min_reward_amount
    const surveyData = {
      title: "보상금 부족 설문",
      description: "설명",
      targetNumber: 1000, // 인원이 너무 많아 1인당 보상금이 적어지는 경우
      questions: [],
    };

    // 풀 금액은 50 ETH이지만 1000명으로 나누면 0.05 ETH로 min_reward_amount(0.1 ETH) 미만
    const poolAmount = ethers.parseEther("50");

    await expect(
      factory.createSurvey(surveyData, { value: poolAmount })
    ).to.be.revertedWith("Insufficient reward amount");
  });

  // 5. 생성된 설문조사 저장 및 getSurveys 반환 테스트
  it("should store created surveys and return them from getSurveys", async () => {
    // TODO: create multiple surveys and check getSurveys output
    const surveyData = {
      title: "다중 설문",
      description: "설명",
      targetNumber: 10,
      questions: [],
    };

    const poolAmount = ethers.parseEther("50");

    // 설문 2개 연속 생성
    await factory.createSurvey(surveyData, { value: poolAmount });
    await factory.createSurvey(surveyData, { value: poolAmount });

    const surveys = await factory.getSurveys();
    expect(surveys.length).to.equal(2);
    expect(surveys[0]).to.properAddress;
    expect(surveys[1]).to.properAddress;
  });
});