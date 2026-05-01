import XCTest
@testable import FocusPath

final class ClaudeServiceTests: XCTestCase {

    func testParseQuizResponse() throws {
        let json = """
        [
          {"question":"What is tested?","choices":["A","B","C","D"],"correctIndex":0,"explanation":"A is correct."},
          {"question":"Second?","choices":["P","Q","R","S"],"correctIndex":1,"explanation":"Q is correct."},
          {"question":"Third?","choices":["X","Y","Z","W"],"correctIndex":2,"explanation":"Z is correct."}
        ]
        """.data(using: .utf8)!

        let questions = try JSONDecoder().decode([QuizQuestion].self, from: json)
        XCTAssertEqual(questions.count, 3)
        XCTAssertEqual(questions[0].choices.count, 4)
        XCTAssertEqual(questions[1].correctIndex, 1)
        XCTAssertFalse(questions[2].explanation.isEmpty)
    }
}
