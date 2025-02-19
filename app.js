const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');


// MongoDB Atlas 연결
mongoose.connect('mongodb+srv://dukong824:geKKg6vX9xR6l6MF@cluster0.fvdak.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB Connected');
}).catch(err => {
  console.log('Error connecting to MongoDB:', err);
});

const app = express();
const port = 3000;

app.use(cors());

// body-parser 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const QuestionSchema = new mongoose.Schema({
    question: String,
    answered: { type: Boolean, default: false }, // 답변 여부
});
  
const Question = mongoose.model('Question', QuestionSchema);
  
// saveQuestion API
app.post('/saveQuestion', async (req, res) => {
    const { question } = req.body;
    const newQuestion = new Question({ question });
  
    try {
      await newQuestion.save();
      res.status(200).send('Question saved successfully');
    } catch (err) {
      res.status(500).send('Error saving question');
    }
  });
  

// 서버 시작
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


// 질문 가져오기 API
app.get('/getQuestions', async (req, res) => {
    console.log("GET /getQuestions 요청 받음");  // 로그 출력
    try {
      const questions = await Question.find();
      res.status(200).json(questions);
    } catch (err) {
      console.log('Error fetching questions:', err);
      res.status(500).send('Error fetching questions');
    }
  });
    
  // 답변 저장 API
  const AnswerSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    answer: String,
  });
  
  const Answer = mongoose.model('Answer', AnswerSchema);
  
  app.post('/saveAnswer', async (req, res) => {
    const { questionId, answer } = req.body;
    const newAnswer = new Answer({ questionId, answer });
  
    try {
      await newAnswer.save();
      res.status(200).send('Answer saved successfully');
    } catch (err) {
      res.status(500).send('Error saving answer');
    }
  });

// /getPosts 엔드포인트: 질문과 해당하는 답변(있는 경우)을 함께 조회
app.get('/getPosts', async (req, res) => {
    try {
      const posts = await Question.aggregate([
        {
          $lookup: {
            from: 'answers',           // Answer 컬렉션과 조인
            localField: '_id',         // Question의 _id
            foreignField: 'questionId',// Answer의 questionId 필드
            as: 'answers'              // 결과를 answers 배열로 저장
          }
        }
      ]);
      res.status(200).json(posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).send('Error fetching posts');
    }
  });
  