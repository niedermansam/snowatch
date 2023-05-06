import { testMetadata, testForecast, testHourlyForecast } from "../../modules/forecast/testData";
import { testDiscussion, testDiscussionMetadata } from "../../modules/forecast/testDiscussion";

export const forecast = {
  metadata: testMetadata,
  forecast: testForecast,
  hourlyForecast: testHourlyForecast,
};

export const forecastDiscussion = {
  metadata: testDiscussionMetadata,
  discussion: testDiscussion,
}
