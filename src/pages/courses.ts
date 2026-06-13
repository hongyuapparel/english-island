import { COURSES } from '../data/courses'
import { MODERN_FAMILY } from '../data/modern-family'
import { storage } from '../storage'
import { renderLesson } from './lesson'
import { renderModernFamily } from './modern-family'

export function renderCourses(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'page courses-page'
  const progress = storage.getLessonProgress()

  function renderList() {
    el.innerHTML = `
      <header class="page-header">
        <h1>📚 课程共读</h1>
        <p class="subtitle">图文教材 & 带注释的美剧「书」</p>
      </header>

      <div class="course-grid">
        <div class="course-card featured-mf" data-mf="1" style="--course-color:#ff8c42">
          <div class="course-cover" style="background-image:url('${MODERN_FAMILY.coverImage}')">
            <span class="course-emoji">${MODERN_FAMILY.emoji}</span>
            <span class="course-featured-badge">推荐</span>
          </div>
          <div class="course-info">
            <h2>${MODERN_FAMILY.titleZh}</h2>
            <p>${MODERN_FAMILY.description}</p>
            <div class="course-meta">第 1 季 24 集 · 导入字幕原台词 · 点击查词</div>
          </div>
        </div>
        ${COURSES.map((c) => {
          const doneCount = c.lessons.filter((l) => progress[l.id]?.done).length
          return `
          <div class="course-card" data-course="${c.id}" style="--course-color:${c.color}">
            <div class="course-cover" style="background-image:url('${c.coverImage}')">
              <span class="course-emoji">${c.emoji}</span>
            </div>
            <div class="course-info">
              <h2>${esc(c.title)}</h2>
              <p>${esc(c.description)}</p>
              <div class="course-meta">${c.lessons.length} 课 · 已完成 ${doneCount}</div>
            </div>
          </div>
        `
        }).join('')}
      </div>
    `

    el.querySelector('[data-mf]')?.addEventListener('click', () => {
      el.innerHTML = ''
      el.appendChild(renderModernFamily(renderList))
    })

    el.querySelectorAll('.course-card:not([data-mf])').forEach((card) => {
      card.addEventListener('click', () => {
        showCourseDetail((card as HTMLElement).dataset.course!)
      })
    })
  }

  function showCourseDetail(courseId: string) {
    const course = COURSES.find((c) => c.id === courseId)
    if (!course) return

    el.innerHTML = `
      <button class="btn btn-ghost back-btn" id="back">← 全部课程</button>
      <div class="course-detail-header" style="background-image:url('${course.coverImage}')">
        <div class="course-detail-overlay">
          <span class="course-emoji-lg">${course.emoji}</span>
          <h1>${esc(course.title)}</h1>
          <p>${esc(course.description)}</p>
        </div>
      </div>
      <div class="lesson-list">
        ${course.lessons
          .map((l) => {
            const prog = progress[l.id]
            const done = prog?.done
            return `
            <button class="lesson-card" data-lesson="${l.id}">
              <div class="lesson-thumb" style="background-image:url('${l.coverImage}')"></div>
              <div class="lesson-info">
                <div class="lesson-level">${l.level} · ${l.duration}</div>
                <h3>${esc(l.title)}</h3>
                <p>${esc(l.subtitle)}</p>
                ${done ? '<span class="lesson-done">✓ 已完成</span>' : prog ? `<span class="lesson-progress">读到第 ${prog.page + 1} 页</span>` : ''}
              </div>
              <span class="lesson-arrow">→</span>
            </button>
          `
          })
          .join('')}
      </div>
    `

    el.querySelector('#back')?.addEventListener('click', renderList)
    el.querySelectorAll('.lesson-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lessonId = (btn as HTMLElement).dataset.lesson!
        el.innerHTML = ''
        el.appendChild(
          renderLesson(lessonId, () => showCourseDetail(courseId)),
        )
      })
    })
  }

  renderList()
  return el
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
