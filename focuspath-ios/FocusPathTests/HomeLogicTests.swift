import XCTest
@testable import FocusPath

final class HomeLogicTests: XCTestCase {

    private let calendar = Calendar.current
    private let ref = Date() // single reference point for all relative dates

    // MARK: — streak

    func testStreakZeroWithNoSessions() {
        XCTAssertEqual(HomeLogic.streak(sessionDates: [], referenceDate: ref), 0)
    }

    func testStreakOneForToday() {
        XCTAssertEqual(HomeLogic.streak(sessionDates: [ref], referenceDate: ref), 1)
    }

    func testStreakCountsYesterdayWhenTodayNotDone() {
        let yesterday = calendar.date(byAdding: .day, value: -1, to: ref)!
        // User completed yesterday but hasn't done today yet — streak should be alive
        XCTAssertEqual(HomeLogic.streak(sessionDates: [yesterday], referenceDate: ref), 1)
    }

    func testStreakThreeConsecutiveDays() {
        let yesterday  = calendar.date(byAdding: .day, value: -1, to: ref)!
        let twoDaysAgo = calendar.date(byAdding: .day, value: -2, to: ref)!
        XCTAssertEqual(HomeLogic.streak(sessionDates: [ref, yesterday, twoDaysAgo], referenceDate: ref), 3)
    }

    func testStreakBreaksWithGap() {
        let twoDaysAgo = calendar.date(byAdding: .day, value: -2, to: ref)!
        // yesterday and today missing → streak is 0 (gap breaks it)
        XCTAssertEqual(HomeLogic.streak(sessionDates: [ref, twoDaysAgo], referenceDate: ref), 1)
    }

    func testStreakIgnoresDuplicatesOnSameDay() {
        let oneHourAgo = ref.addingTimeInterval(-3600)
        XCTAssertEqual(HomeLogic.streak(sessionDates: [ref, oneHourAgo], referenceDate: ref), 1)
    }

    func testStreakZeroWhenOnlyTwoDaysAgo() {
        let twoDaysAgo = calendar.date(byAdding: .day, value: -2, to: ref)!
        // Neither today nor yesterday → 0
        XCTAssertEqual(HomeLogic.streak(sessionDates: [twoDaysAgo], referenceDate: ref), 0)
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

    func testSoulRingReadAlone() {
        XCTAssertEqual(
            HomeLogic.soulRingProgress(readDone: true, meditateDone: false, journalDone: false),
            1.0 / 3.0, accuracy: 0.001)
    }

    func testSoulRingMeditateAlone() {
        XCTAssertEqual(
            HomeLogic.soulRingProgress(readDone: false, meditateDone: true, journalDone: false),
            1.0 / 3.0, accuracy: 0.001)
    }

    func testSoulRingJournalAlone() {
        XCTAssertEqual(
            HomeLogic.soulRingProgress(readDone: false, meditateDone: false, journalDone: true),
            1.0 / 3.0, accuracy: 0.001)
    }

    func testSoulRingTwoOfThree() {
        XCTAssertEqual(
            HomeLogic.soulRingProgress(readDone: true, meditateDone: true, journalDone: false),
            2.0 / 3.0, accuracy: 0.001)
    }

    // MARK: — dayCount

    func testDayCountOnJoinDate() {
        XCTAssertEqual(HomeLogic.dayCount(joinDate: ref, today: ref), 1)
    }

    func testDayCountAfterTwoWeeks() {
        let joinDate = calendar.date(byAdding: .day, value: -13, to: ref)!
        XCTAssertEqual(HomeLogic.dayCount(joinDate: joinDate, today: ref), 14)
    }

    func testDayCountMinimumOne() {
        let future = calendar.date(byAdding: .day, value: 5, to: ref)!
        XCTAssertEqual(HomeLogic.dayCount(joinDate: future, today: ref), 1)
    }

    // MARK: — greeting

    func testGreetingMidnight() {
        XCTAssertEqual(HomeLogic.greeting(hour: 0), "Good morning")
    }

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
