import SwiftUI

enum Theme {
    static let cream        = Color(red: 0.992, green: 0.965, blue: 0.925)
    static let creamDark    = Color(red: 0.980, green: 0.922, blue: 0.843)
    static let border       = Color(red: 0.910, green: 0.855, blue: 0.718)
    static let saffron      = Color(red: 0.910, green: 0.361, blue: 0.016)
    static let saffronLight = Color(red: 0.957, green: 0.549, blue: 0.024)
    static let brown        = Color(red: 0.239, green: 0.169, blue: 0.122)
    static let brownMid     = Color(red: 0.478, green: 0.361, blue: 0.227)
    static let brownMuted   = Color(red: 0.627, green: 0.518, blue: 0.361)
    static let greenOk      = Color(red: 0.298, green: 0.686, blue: 0.314)
    static let redErr       = Color(red: 0.898, green: 0.224, blue: 0.208)

    static let saffronGradient = LinearGradient(
        colors: [saffron, saffronLight],
        startPoint: .leading,
        endPoint: .trailing
    )
}
