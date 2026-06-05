import { studyContract } from "@language-learning/api-contract";
import { Controller, Inject } from "@nestjs/common";
import { TsRestHandler, tsRestHandler } from "@ts-rest/nest";
import { StudyService } from "./study.service";

@Controller()
export class StudyController {
  constructor(@Inject(StudyService) private readonly studyService: StudyService) {}

  @TsRestHandler(studyContract.getSession)
  getSession() {
    const studyService = this.studyService;
    return tsRestHandler(studyContract.getSession, async () => ({
        status: 200,
        body: await studyService.getSession()
      }));
  }

  @TsRestHandler(studyContract.submitReview)
  submitReview() {
    const studyService = this.studyService;
    return tsRestHandler(studyContract.submitReview, async ({ body }) => {
        const response = await studyService.submitReview(body.itemId, body.answer);
        if (!response) {
          return {
            status: 404,
            body: { message: `Study item not found: ${body.itemId}` }
          };
        }

        return {
          status: 200,
          body: response
        };
      });
  }

  @TsRestHandler(studyContract.getWordPair)
  getWordPair() {
    const studyService = this.studyService;
    return tsRestHandler(studyContract.getWordPair, async () => ({
        status: 200,
        body: { wordPair: await studyService.getWordPair() }
      }));
  }

  @TsRestHandler(studyContract.getKanaQuiz)
  getKanaQuiz() {
    const studyService = this.studyService;
    return tsRestHandler(studyContract.getKanaQuiz, async () => ({
        status: 200,
        body: await studyService.getKanaQuiz()
      }));
  }

  @TsRestHandler(studyContract.submitKanaReview)
  submitKanaReview() {
    const studyService = this.studyService;
    return tsRestHandler(studyContract.submitKanaReview, async ({ body }) => {
        const response = await studyService.submitKanaReview(body.itemId, body.answer);
        if (!response) {
          return {
            status: 404,
            body: { message: `Kana quiz item not found: ${body.itemId}` }
          };
        }

        return {
          status: 200,
          body: response
        };
      });
  }

  @TsRestHandler(studyContract.getReadingLab)
  getReadingLab() {
    const studyService = this.studyService;
    return tsRestHandler(studyContract.getReadingLab, async () => ({
        status: 200,
        body: { passage: await studyService.getReadingLab() }
      }));
  }
}
