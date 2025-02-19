function toggleModal() {
    const modal = document.querySelector('.container');
    modal.classList.toggle('hidden'); // hidden 클래스를 토글
}

// 질문 저장하기
async function saveQuestion() {
  const question = document.getElementById('question').value;

  if (!question) {
    alert('질문을 입력하세요!');
    return;
  }

  // 서버에 질문 보내기
  const response = await fetch('http://localhost:3000/saveQuestion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });

  if (response.ok) {
    alert('질문이 저장되었습니다!');
  } else {
    alert('질문 저장에 실패했습니다.');
  }

  // 질문 입력란 비우기
  document.getElementById('question').value = '';
  toggleModal();  // 모달 닫기
}

async function loadQuestions() {
  const response = await fetch('http://localhost:3000/getQuestions');
  const questions = await response.json();

  const answerPostDiv = document.querySelector('.answerpost');
  if (!answerPostDiv) {
    console.error('Cannot find element with class "answerpost"');
    return;
  }

  answerPostDiv.innerHTML = ''; // 기존 내용 삭제

  questions.forEach((question, index) => {
    // 질문과 답변 입력란 생성
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question-item');
    
    const questionText = document.createElement('p');
    questionText.textContent = `질문: ${question.question}`;
    questionText.id = `question-text-${question._id}`; // 고유한 id 설정
    
    // 질문이 답변되었으면 색상 변경 (초록색)
    if (question.answered) {
      questionText.style.color = 'green';
    }
    
    const answerTextarea = document.createElement('textarea');
    answerTextarea.id = `answer-${index}`;
    answerTextarea.placeholder = "답변을 입력하세요!";
    
    const submitButton = document.createElement('button');
    submitButton.textContent = "답변 제출";
    submitButton.onclick = () => submitAnswer(question._id, answerTextarea.value);
    
    questionDiv.appendChild(questionText);
    questionDiv.appendChild(answerTextarea);
    questionDiv.appendChild(submitButton);
    
    answerPostDiv.appendChild(questionDiv);
  });
}

// 답변을 서버에 제출하는 함수
async function submitAnswer(questionId, answer) {
  if (!answer.trim()) {
    alert("답변을 입력하세요!");
    return;
  }

  const response = await fetch('http://localhost:3000/saveAnswer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ questionId, answer })
  });

  if (response.ok) {
    alert('답변이 저장되었습니다!');
    // 질문 텍스트 색상 변경 (초록색으로)
    const questionText = document.querySelector(`#question-text-${questionId}`);
    if (questionText) {
      questionText.style.color = 'green'; // 초록색으로 변경
    }    
  } else {
    alert('답변 저장에 실패했습니다.');
  }
}

// 페이지 로드 시 질문 목록을 불러옴
window.onload = loadQuestions;


// 서버에서 질문과 답변(있는 경우)을 가져와서 .post div에 표시하는 함수
async function loadPosts() {
  try {
    const response = await fetch('http://localhost:3000/getPosts');
    if (!response.ok) {
      throw new Error("네트워크 응답에 문제가 있습니다.");
    }
    const posts = await response.json();
    const postDiv = document.querySelector('.post');
    postDiv.innerHTML = ''; // 기존 내용 초기화

    posts.forEach(post => {
      // 답변이 있을 경우에만 표시
      if (post.answers && post.answers.length > 0) {
        // 게시물 컨테이너 생성
        const postItem = document.createElement('div');
        postItem.classList.add('post-item'); // CSS 클래스만 사용
        
        // 질문 표시
        const questionElem = document.createElement('h3');
        questionElem.textContent = "Q." + post.question;
        postItem.appendChild(questionElem);
        
        // 답변 표시
        const answerElem = document.createElement('p');
        answerElem.textContent = "A. " + post.answers[0].answer;
        answerElem.classList.add('answer-text'); // 답변에 대한 스타일은 'answer-text' 클래스를 사용
        postItem.appendChild(answerElem);

        // .post div에 게시물 추가
        postDiv.appendChild(postItem);
      }
    });
  } catch (error) {
    console.error("게시물을 불러오는 중 오류 발생:", error);
  }
}

// 페이지 로드 시 게시물을 불러옴
window.addEventListener('DOMContentLoaded', loadPosts);
