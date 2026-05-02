import XCTest
import Combine
@testable import ChargerScreamer

final class ChargerMonitorTests: XCTestCase {
    var sut: ChargerMonitor!
    var cancellables: Set<AnyCancellable> = []

    override func setUp() {
        super.setUp()
        sut = ChargerMonitor()
    }

    override func tearDown() {
        cancellables.removeAll()
        sut = nil
        super.tearDown()
    }

    func test_initialState_notCharging() {
        XCTAssertFalse(sut.isCharging)
    }

    func test_simulatePlugFiresOnPlug() {
        let exp = expectation(description: "onPlug called")
        sut.onPlug = { exp.fulfill() }
        sut.simulatePlug()
        wait(for: [exp], timeout: 1.0)
    }

    func test_simulateUnplugFiresOnUnplug() {
        sut.simulatePlug()
        let exp = expectation(description: "onUnplug called")
        sut.onUnplug = { exp.fulfill() }
        sut.simulateUnplug()
        wait(for: [exp], timeout: 1.0)
    }

    func test_simulatePlugSetsIsCharging() {
        sut.simulatePlug()
        XCTAssertTrue(sut.isCharging)
    }

    func test_simulateUnplugClearsIsCharging() {
        sut.simulatePlug()
        sut.simulateUnplug()
        XCTAssertFalse(sut.isCharging)
    }
}
