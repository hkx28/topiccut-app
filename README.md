# TopicCut 🎯

AI-powered content summarizer with advanced news analysis capabilities.

## ✨ Features

- 🌙 **Dark/Light Mode Toggle** - Seamless theme switching
- 📝 **Three Content Types**:
  - **Basic**: General content summarization with marketing focus
  - **News**: Professional journalism-style analysis with 5W1H structure
  - **Safety**: Comprehensive safety guides with practical tips
- 📁 **File Upload Support** - Process .vtt, .pdf, .txt files
- ⚡ **Real-time Analysis** - Instant AI-powered content processing
- 📋 **Copy-to-Clipboard** - Easy sharing and workflow integration
- 🔐 **Secure Authentication** - AWS Cognito integration

## 🛠 Tech Stack

- **Frontend**: React 19, Tailwind CSS
- **Backend**: AWS Lambda, API Gateway
- **Storage**: AWS S3
- **AI**: AWS Bedrock (Claude 3.5 Haiku)
- **Authentication**: AWS Cognito
- **Infrastructure**: AWS CloudFormation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- AWS Account (for backend services)

### Installation

```bash
# Clone repository
git clone https://github.com/hkx28/topiccut-app.git
cd topiccut-app

# Install dependencies
npm install

# Start development server
npm start
```

### Environment Setup

Create `.env` file in root directory:
```env
REACT_APP_API_URL=your_api_gateway_url
REACT_APP_COGNITO_DOMAIN=your_cognito_domain
```

## 📁 Project Structure

```
topiccut-app/
├── src/
│   ├── components/
│   │   └── ContentSummarizer.js
│   ├── App.js
│   └── index.js
├── public/
├── aws/
│   ├── Content_Summarizer_v2.yaml
│   └── Content_Summarizer_v3.yaml
└── README.md
```

## 🏗 AWS Infrastructure

Deploy using CloudFormation:

```bash
# Deploy backend infrastructure
aws cloudformation create-stack \
  --stack-name topiccut-backend \
  --template-body file://aws/Content_Summarizer_v3.yaml \
  --capabilities CAPABILITY_NAMED_IAM
```

## 📖 Usage

1. **Authentication**: Login with AWS Cognito
2. **Content Input**: Choose between text input or file upload
3. **Content Type**: Select analysis type (Basic/News/Safety)
4. **Analysis**: Click "AI 요약 생성" for instant processing
5. **Results**: View structured summaries with copy functionality

## 🎯 Content Types

| Type | Purpose | Output Style |
|------|---------|--------------|
| **Basic** | Marketing & Social Media | Engaging, shareable content |
| **News** | Journalism & Reporting | Professional 5W1H structure |
| **Safety** | Safety Protocols | Comprehensive guides with tips |

## 🔧 Development

```bash
# Development mode
npm start

# Build for production
npm run build

# Run tests
npm test
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

For support and questions:
- Email: hkx228@gmail.com
- Issues: [GitHub Issues](https://github.com/hkx28/topiccut-app/issues)

---

**Built with using AWS and React**
EOF
```
