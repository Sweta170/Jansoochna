/**
 * Mock AI Service for JanSoochna Chatbot
 * Simulates OpenAI responses for immediate testing/demo.
 */

const mockChatbotLogic = (message, session) => {
    const input = message.toLowerCase();
    let result = {
        reply: "I'm not exactly sure how to help with that. Could you try rephrasing? (e.g., 'hello', 'file a report', or 'check status #123')",
        intent: "general",
        action: "none",
        entities: {},
        confidence: 0.9
    };

    // 1. Simple Greetings
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
        result.reply = "Hello! I am your JanSoochna Assistant. I can help you file civic complaints, check report status, or answer questions about the platform. How can I assist you today?";
        result.intent = "general";
    }

    // 2. Complaint Filing Flow
    else if (input.includes('file') || input.includes('report') || input.includes('complaint') || input.includes('broken') || input.includes('pothole')) {
        result.intent = "file_complaint";
        if (!session.data.category) {
            result.reply = "I'd be happy to help you file a report. What's the main issue? (e.g., Roads, Electricity, Waste, Water)";
            result.action = "prompt_description";
        } else if (!session.data.location) {
            result.reply = "Got it. And where is this issue located? (e.g., PHC Road, Sector 4)";
            result.action = "prompt_location";
        } else {
            result.reply = "Thank you. Should I go ahead and submit this report for you?";
            result.action = "confirm_submission";
        }
    }

    // 3. Status Check
    else if (input.includes('status') || input.includes('check') || input.match(/#\d+/)) {
        const match = input.match(/#(\d+)/);
        const id = match ? match[1] : null;

        result.intent = "check_status";
        if (id) {
            result.reply = `Checking status for Report #${id}... It is currently **IN PROGRESS**. The assigned officer is currently reviewing the site.`;
            result.entities.complaintId = id;
        } else {
            result.reply = "I can check that for you! What is your Complaint ID? (e.g., #101)";
        }
    }

    // 4. FAQ / Knowledge
    else if (input.includes('point') || input.includes('reward') || input.includes('rank')) {
        result.reply = "You earn Impact Points for every valid report you file and every update you provide. Higher points lead to better Ranks (Bronze to Platinum) in the Hall of Fame!";
        result.intent = "faq";
    }

    else if (input.includes('sla') || input.includes('time') || input.includes('long')) {
        result.reply = "Most civic issues are addressed within 7-14 business days. You'll receive a notification as soon as there is an update from the authorities.";
        result.intent = "faq";
    }

    return result;
};

module.exports = { mockChatbotLogic };
