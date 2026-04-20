import XCTest
@testable import ChargerScreamer

final class SoundPackStoreTests: XCTestCase {
    var sut: SoundPackStore!
    var testDefaults: UserDefaults!

    override func setUp() {
        super.setUp()
        testDefaults = UserDefaults(suiteName: "test-\(UUID().uuidString)")!
        sut = SoundPackStore(defaults: testDefaults)
    }

    override func tearDown() {
        sut = nil
        testDefaults = nil
        super.tearDown()
    }

    func test_defaultPackIsFirst() {
        XCTAssertEqual(sut.selectedPack.id, SoundPack.all[0].id)
    }

    func test_selectPackPersistsAcrossInstances() {
        sut.select(SoundPack.all[2])
        let sut2 = SoundPackStore(defaults: testDefaults)
        XCTAssertEqual(sut2.selectedPack.id, SoundPack.all[2].id)
    }

    func test_plugCountIncrements() {
        sut.incrementPlugCount()
        sut.incrementPlugCount()
        XCTAssertEqual(sut.plugCountToday, 2)
    }

    func test_plugCountLabelSingular() {
        sut.incrementPlugCount()
        XCTAssertEqual(sut.plugCountLabel, "Charged 1 time today ⚡")
    }

    func test_plugCountLabelPlural() {
        sut.incrementPlugCount()
        sut.incrementPlugCount()
        XCTAssertEqual(sut.plugCountLabel, "Charged 2 times today ⚡")
    }
}
