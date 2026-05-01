import XCTest
@testable import FocusPath

final class HomeLogicTests: XCTestCase {

    private let calendar = Calendar.current

    // MARK: — streak

    func testStreakZeroWithNoSessions() {
        XCTAssertEqual(HomeLogic.streak(sessionDates: []), 0)
    }

    func testStreakOneForToday() {
        XCTAssertEqual(HomeLogic.streak(sessionDates: [Date()]), 1)
    }

    func testStreakThreeConsecutiveDays() {
        let today = Date()
        let yesterday   = calendar.date(byAdding: .day, value: -1, to: today)!
        let twoDaysAgo  = calendar.date(byAdding: .day, value: -2, to: today)!
        XCTAssertEqual(HomeLogic.streak(sessionDates: [today, yesterday, twoDaysAgo]), 3)
    }

    func testStreakBreaksWithGap() {
        let today      = Date()
        let twoDaysAgo = calendar.date(byAdding: .day, value: -2, to: today)!
        // yesterday missing → streak is 1 (today only)
        XCTAssertEqual(HomeLogic.streak(sessionDates: [today, twoDaysAgo]), 1)
    }

    func testStreakIgnoresDuplicatesOnSameDay() {
        let now         = Date()
        let oneHourAgo  = now.addingTimeInterval(-3600)
        XCTAssertEqual(HomeLogic.streak(sessionDates: [now, oneHourAgo]), 1)
    }

    func testStreakZeroWhenOnlyOldSessions() {
        let twoDaysAgo = calendar.date(byAdding: .day, value: -2, to: Date())!
        XCTAssertEqual(HomeLogic.streak(sessionDates: [twoDaysAgo]), 0)
    }

    // MARK: — soulRingProgress

    func testSoulRingAllDone() {
        XCTAssertEqual(
            HomeLogic.soulRingProgress(readDone: true, meditateDone: true, journalDone: true),
            1.0, accuracy: 0.001)
    }

    func testSoulRingNoneDone() {
        XCTAssertEqual(
            HomeLogic.soulRingProgress(readDone: false, meditateDone: false, journalDone: false),
            0.0, accuracy: 0.001)
    }

    func testSoulRingOneOfThree() {
        XCTAssertEqual(
            HomeLogic.soulRingProgress(readDone: true, meditateDone: false, journalDone: false),
            1.0 / 3.0, accuracy: 0.001)
    }

    func testSoulRingTwoOfThree() {
        XCTAssertEqual(
            HomeLogic.soulRingProgress(readDone: true, meditateDone: true, journalDone: false),
            2.0 / 3.0, accuracy: 0.001)
    }

    // MARK: — dayCount

    func testDayCountOnJoinDate() {
        XCTAssertEqual(HomeLogic.dayCount(joinDate: Date(), today: Date()), 1)
    }

    func testDayCountAfterTwoWeeks() {
        let joinDate = calendar.date(byAdding: .day, value: -13, to: Date())!
        XCTAssertEqual(HomeLogic.dayCount(joinDate: joinDate), 14)
    }

    func testDayCountMinimumOne() {
        // joinDate in the future should still return 1
        let future = calendar.date(byAdding: .day, value: 5, to: Date())!
        XCTAssertEqual(HomeLogic.dayCount(joinDate: future), 1)
    }

    // MARK: — greeting

    func testGreetingMorning() {
        XCTAssertEqual(HomeLogic.greeting(hour: 6),  "Good morning")
        XCTAssertEqual(HomeLogic.greeting(hour: 11), "Good morning")
    }

    func testGreetingAfternoon() {
        XCTAssertEqual(HomeLogic.greeting(hour: 12), "Good afternoon")
        XCTAssertEqual(HomeLogic.greeting(hour: 16), "Good afternoon")
    }

    func testGreetingEvening() {
        XCTAssertEqual(HomeLogic.greeting(hour: 17), "Good evening")
        XCTAssertEqual(HomeLogic.greeting(hour: 22), "Good evening")
    }
}
