import XCTest
@testable import FocusPath

final class PassageStoreTests: XCTestCase {

    func testLoadsPassages() {
        let store = PassageStore.shared
        XCTAssertGreaterThan(store.all.count, 0)
    }

    func testTodayPassageDeterministic() {
        let store = PassageStore.shared
        let date = "2026-05-01"
        let a = store.todayPassage(dateString: date, traditions: nil)
        let b = store.todayPassage(dateString: date, traditions: nil)
        XCTAssertEqual(a.id, b.id)
    }

    func testTodayPassageDiffersAcrossDates() {
        let store = PassageStore.shared
        let ids = ["2026-05-01","2026-05-02","2026-05-03","2026-05-04"]
            .map { store.todayPassage(dateString: $0, traditions: nil).id }
        let unique = Set(ids)
        XCTAssertGreaterThan(unique.count, 1)
    }

    func testFiltersByTradition() {
        let store = PassageStore.shared
        let p = store.todayPassage(dateString: "2026-05-01", traditions: [.stoics])
        XCTAssertEqual(p.tradition, .stoics)
    }

    func testGetByIdFound() {
        let store = PassageStore.shared
        let p = store.passage(byId: store.all.first!.id)
        XCTAssertNotNil(p)
    }

    func testGetByIdMissing() {
        XCTAssertNil(PassageStore.shared.passage(byId: "not-real"))
    }
}
