import SwiftUI

enum Theme {
    // Backgrounds
    static let background   = Color(red: 0.059, green: 0.059, blue: 0.102) // #0f0f1a
    static let surface      = Color(white: 1, opacity: 0.04)
    static let surfaceAlt   = Color(white: 1, opacity: 0.07)

    // Borders
    static let border       = Color(white: 1, opacity: 0.08)
    static let borderStrong = Color(white: 1, opacity: 0.15)

    // Text
    static let text         = Color.white
    static let textMuted    = Color(white: 1, opacity: 0.4)
    static let textSubtle   = Color(white: 1, opacity: 0.22)

    // Accents
    static let saffron      = Color(red: 0.957, green: 0.635, blue: 0.380) // #f4a261
    static let saffronDeep  = Color(red: 0.910, green: 0.361, blue: 0.016) // #e85d04
    static let green        = Color(red: 0.525, green: 0.937, blue: 0.675) // #86efac
    static let purple       = Color(red: 0.659, green: 0.333, blue: 0.969) // #a855f7

    // Status
    static let error        = Color(red: 0.898, green: 0.224, blue: 0.208)

    static let saffronGradient = LinearGradient(
        colors: [saffronDeep, saffron],
        startPoint: .leading,
        endPoint: .trailing
    )

    static let orangeGradient = LinearGradient(
        colors: [saffronDeep, saffron],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}
