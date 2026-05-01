import SwiftUI

struct QuizQuestionView: View {
    let question: QuizQuestion
    let questionNumber: Int
    let total: Int
    let onAnswer: (Bool) -> Void

    @State private var selected: Int? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 6) {
                ForEach(0..<total, id: \.self) { i in
                    Capsule()
                        .fill(dotColor(for: i))
                        .frame(maxWidth: .infinity)
                        .frame(height: 4)
                }
            }

            Text("Question \(questionNumber) of \(total)")
                .font(.system(size: 11, weight: .bold))
                .tracking(1.5)
                .foregroundStyle(Theme.brownMuted)

            Text("\u{201C}\(question.question)\u{201D}")
                .font(.system(size: 17, design: .serif))
                .foregroundStyle(Theme.brown)
                .italic()
                .lineSpacing(4)

            VStack(spacing: 10) {
                ForEach(Array(question.choices.enumerated()), id: \.offset) { i, choice in
                    Button(action: { choose(i) }) {
                        HStack {
                            Text(choice)
                                .font(.system(size: 15))
                                .foregroundStyle(choiceTextColor(i))
                                .multilineTextAlignment(.leading)
                            Spacer()
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                        .background(choiceBg(i))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(choiceBorder(i), lineWidth: 1.5)
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                    .disabled(selected != nil)
                }
            }

            if let sel = selected {
                HStack(alignment: .top, spacing: 8) {
                    Text(sel == question.correctIndex ? "\u{2713}" : "\u{2717}")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundStyle(sel == question.correctIndex ? Theme.greenOk : Theme.redErr)
                    Text(question.explanation)
                        .font(.system(size: 13))
                        .foregroundStyle(Theme.brownMid)
                }
                .padding(12)
                .background(sel == question.correctIndex
                    ? Theme.greenOk.opacity(0.08)
                    : Theme.redErr.opacity(0.08))
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(sel == question.correctIndex ? Theme.greenOk : Theme.redErr, lineWidth: 1.5)
                )
                .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }
    }

    private func choose(_ i: Int) {
        guard selected == nil else { return }
        selected = i
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
            onAnswer(i == question.correctIndex)
        }
    }

    private func dotColor(for i: Int) -> Color {
        if i < questionNumber - 1 { return Theme.saffron }
        if i == questionNumber - 1 { return Theme.saffronLight }
        return Theme.border
    }

    private func choiceBg(_ i: Int) -> Color {
        guard let sel = selected else { return Theme.creamDark }
        if i == question.correctIndex { return Theme.greenOk.opacity(0.1) }
        if i == sel { return Theme.redErr.opacity(0.08) }
        return Theme.creamDark.opacity(0.5)
    }

    private func choiceBorder(_ i: Int) -> Color {
        guard let sel = selected else { return Theme.border }
        if i == question.correctIndex { return Theme.greenOk }
        if i == sel { return Theme.redErr }
        return Theme.border.opacity(0.4)
    }

    private func choiceTextColor(_ i: Int) -> Color {
        guard let sel = selected else { return Theme.brown }
        if i == question.correctIndex { return Color(red: 0.18, green: 0.49, blue: 0.20) }
        if i == sel { return Theme.redErr }
        return Theme.brownMuted
    }
}
