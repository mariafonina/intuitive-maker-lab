import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import mariPhoto from "@/assets/mari-photo.jpeg";
import bookCover from "@/assets/book-cover.png";

export default function Profile() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Блокировка скролла при открытом меню
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <div className="bg-background text-foreground">
      {/* ПРОГРЕСС-БАР */}
      <ProgressBar />
      
      {/* НАВИГАЦИЯ */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-lg">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a href="/" className="text-lg font-bold">@mariafonina</a>

          {/* Десктоп навигация */}
          <div className="hidden items-center space-x-8 md:flex">
            <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">Обо мне</a>
            <a href="#projects" className="text-muted-foreground hover:text-primary transition-colors">Проекты</a>
            <a href="#book" className="text-muted-foreground hover:text-primary transition-colors">Книга</a>
            <a href="#faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</a>
            <a href="#contacts" className="text-muted-foreground hover:text-primary transition-colors">Контакты</a>
          </div>

          {/* Мобильное меню кнопка */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="z-50 block md:hidden"
          >
            {!mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </nav>

        {/* Мобильное меню */}
        {mobileMenuOpen && (
          <div className="absolute top-0 left-0 h-screen w-full flex flex-col items-center justify-center space-y-8 bg-background text-2xl font-medium md:hidden">
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-foreground">Обо мне</a>
            <a href="#projects" onClick={() => setMobileMenuOpen(false)} className="text-foreground">Проекты</a>
            <a href="#book" onClick={() => setMobileMenuOpen(false)} className="text-foreground">Книга</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-foreground">FAQ</a>
            <a href="#contacts" onClick={() => setMobileMenuOpen(false)} className="text-foreground">Контакты</a>
          </div>
        )}
      </header>

      <main>
        {/* СЕКЦИЯ: ОБО МНЕ */}
        <section id="about" className="mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
          <div className="mx-auto mb-6 h-32 w-32 rounded-full bg-muted shadow-md md:mb-8 md:h-40 md:w-40 overflow-hidden">
            <img src={mariPhoto} alt="Мари Афонина" className="h-full w-full object-cover" />
          </div>

          <h1 className="text-5xl font-bold tracking-tight md:text-7xl">Мари Афонина</h1>
          <h2 className="mt-4 text-2xl text-muted-foreground md:text-3xl">продюсер, IT-предприниматель</h2>
          
          <div className="mt-24 space-y-20 md:space-y-32">
            {/* Блок 1: Запуски */}
            <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
              <div className="h-80 w-full rounded-2xl bg-muted shadow-lg md:h-96"></div>
              <div className="text-left">
                <h3 className="text-3xl font-bold tracking-tight md:text-4xl">1.5 МЛРД+ РУБ</h3>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
                  Cделала запусков больше чем на 1,5 млрд руб. без бюджета на маркетинг.
                </p>
              </div>
            </div>

            {/* Блок 2: Образование */}
            <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
              <div className="text-left md:order-1">
                <h3 className="text-3xl font-bold tracking-tight md:text-4xl">Образование</h3>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
                  Автор самого масштабного курса по запускам и продюсированию с системой запусков «Масштаб», образовательная лицензия №Л035-01221-58/00204867.
                </p>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
                  14 000 студентов длительных образовательных проектов: продюсеров и экспертов.
                </p>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
                  Больше 100 000 человек прошли бесплатные онлайн-уроки по запускам образовательных проектов.
                </p>
              </div>
              <div className="h-80 w-full rounded-2xl bg-muted shadow-lg md:order-2 md:h-96"></div>
            </div>

            {/* Блок 3: Проекты */}
            <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
              <div className="h-80 w-full rounded-2xl bg-muted shadow-lg md:h-96"></div>
              <div className="text-left">
                <h3 className="text-3xl font-bold tracking-tight md:text-4xl">Проекты</h3>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
                  Создатель чата Мари про вакансии (185 000 участников, <a href="https://t.me/mari_vakansii" target="_blank" rel="noopener noreferrer" className="text-primary underline">https://t.me/mari_vakansii</a>).
                </p>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
                  Автор методологии и ex-амбассадор сервиса с искусственным интеллектом для маркетинга в соцсетях (сервис вышел в прибыль в первый же месяц работы, привлекли 2000 довольных пользователей).
                </p>
              </div>
            </div>

            {/* Блок 4: Личное */}
            <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
              <div className="text-left md:order-1">
                <h3 className="text-3xl font-bold tracking-tight md:text-4xl">Личное</h3>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
                  По образованию — преподаватель русского и литературы с переподготовкой на руководителя образовательной организации.
                </p>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
                  Мама двоих детей (2 года и 8 лет), из многодетной семьи (8 своих детей и 5 приемных у родителей).
                </p>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
                  Создатель проекта Дом там, где мы — бот в телеграм, который помогает жителям приграничных территорий найти работу, деньги на переезд, жилье и волонтера для помощи (2024-2025).
                </p>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
                  Родилась 19.10.1992, Идеалист по MBTI, весы, генератор ⅓.
                </p>
              </div>
              <div className="h-80 w-full rounded-2xl bg-muted shadow-lg md:order-2 md:h-96"></div>
            </div>
          </div>

          {/* Блок 5: Коллаборации */}
          <div className="mt-24 text-left md:mt-32">
            <h3 className="mb-12 text-center text-3xl font-bold md:text-4xl">Коллаборации и выступления</h3>
            
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <p className="font-semibold">Сбербанк</p>
                <p className="mt-2 text-sm text-muted-foreground">Приглашенный спикер (корпоративный тренинг, выступление на онлайн-конференции Сбера)</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <p className="font-semibold">Высшая Школа Экономики</p>
                <p className="mt-2 text-sm text-muted-foreground">Урок для студентов по продюсированию</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <p className="font-semibold">Росатом</p>
                <p className="mt-2 text-sm text-muted-foreground">Наставник в проекте для вожатых (2021-2022)</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <p className="font-semibold">Фонд "Дети-бабочки"</p>
                <p className="mt-2 text-sm text-muted-foreground">Спикер благотворительного форума</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <p className="font-semibold">МГУ</p>
                <p className="mt-2 text-sm text-muted-foreground">Организатор набора студентов и обучения от академиков МГУ (2023-2024)</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <p className="font-semibold">Нобель фест</p>
                <p className="mt-2 text-sm text-muted-foreground">Приглашенный участник (2023)</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <p className="font-semibold">РГСУ</p>
                <p className="mt-2 text-sm text-muted-foreground">Соавтор учебного пособия по маркетингу (2024)</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <p className="font-semibold">Юнеско</p>
                <p className="mt-2 text-sm text-muted-foreground">Участник съезда по бизнес-образованию (2024)</p>
              </div>
            </div>
          </div>
        </section>

        {/* СЕКЦИЯ: ПРОЕКТЫ */}
        <section id="projects" className="bg-muted/30">
          <div className="mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
            <h2 className="text-4xl font-bold tracking-tight md:text-6xl">Проекты</h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground md:text-xl">
              Все мои проекты отвечают одной миссии: помогать онлайн-предпринимателям стать свободными и прибыльными. Я иду к тому, чтобы между предпринимателем и клиентов не стояло сложных программ, огромных команд и затрат.
            </p>

            <div className="mt-16 space-y-12">
              {/* Раздел "Сейчас в продаже" */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Сейчас в продаже</h3>
                <div className="mt-6 rounded-2xl border border-border bg-card p-8 text-left shadow-lg">
                  <h4 className="text-2xl font-bold">ЛАБС</h4>
                  <p className="mt-3 text-lg text-muted-foreground">Проект по искусственному интеллекту и вайбкодингу.</p>
                  <p className="mt-6 font-medium">Стоимость: 33 300 руб.</p>
                  <p className="text-sm text-muted-foreground">Пройдет: 2-23 ноября</p>
                  <Button className="mt-6">
                    Занять место
                  </Button>
                </div>
              </div>

              {/* Раздел "Расписание 2025" */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Расписание 2025</h3>
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                  {/* Карточка 1 */}
                  <div className="rounded-2xl border border-border bg-card p-6 text-left shadow-sm">
                    <h4 className="text-xl font-bold">Экспресс-продажи</h4>
                    <p className="mt-2 text-muted-foreground">Игра в телеграм для тех, кто продает онлайн. 7 дней с ежедневными заданиями от Мари...</p>
                    <p className="mt-4 font-medium">4 990 руб.</p>
                    <p className="text-sm text-muted-foreground">Старт: 12.11.2025</p>
                    <a href="#" className="mt-4 inline-block text-lg font-medium text-primary hover:underline">В предзапись &rarr;</a>
                  </div>
                  {/* Карточка 2 */}
                  <div className="rounded-2xl border border-border bg-card p-6 text-left shadow-sm">
                    <h4 className="text-xl font-bold">ТОП</h4>
                    <p className="mt-2 text-muted-foreground">Мини-курс по коротким роликам + игра</p>
                    <p className="mt-4 font-medium">от 14 990 руб.</p>
                    <p className="text-sm text-muted-foreground">Старт: 4.12.2025</p>
                    <a href="#" className="mt-4 inline-block text-lg font-medium text-primary hover:underline">В предзапись &rarr;</a>
                  </div>
                  {/* Карточка 3 */}
                  <div className="rounded-2xl border border-border bg-card p-6 text-left shadow-sm">
                    <h4 className="text-xl font-bold">Мастер-класс SOLD OUT</h4>
                    <p className="mt-2 text-muted-foreground">Мастер-класс для экспертов, как сделать SOLD OUT и продать все места...</p>
                    <p className="mt-4 font-medium">2 990 руб.</p>
                    <p className="text-sm text-muted-foreground">Старт: 22.12.2025</p>
                    <a href="#" className="mt-4 inline-block text-lg font-medium text-primary hover:underline">В предзапись &rarr;</a>
                  </div>
                </div>
              </div>

              {/* Раздел "Планы на 2026" */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Планы на 2026</h3>
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Карточка 1 */}
                  <div className="rounded-2xl border border-border bg-card/80 p-6 text-left opacity-70 shadow-sm">
                    <h4 className="text-xl font-bold">Масштаб-7</h4>
                    <p className="mt-2 text-muted-foreground">Платформа для обучения и работы в онлайне. Для продюсеров и экспертного бизнеса.</p>
                    <p className="mt-4 font-medium">129 990-230 000 руб.</p>
                    <p className="text-sm text-muted-foreground">Ожидается: февраль-2026</p>
                    <a href="#" className="mt-4 inline-block text-lg font-medium text-primary hover:underline">В предзапись &rarr;</a>
                  </div>
                  {/* Карточка 2 */}
                  <div className="rounded-2xl border border-border bg-card/80 p-6 text-left opacity-70 shadow-sm">
                    <h4 className="text-xl font-bold">ДОМ</h4>
                    <p className="mt-2 text-muted-foreground">Сервисы для онлайн-продаж и комьюнити по подписке</p>
                    <p className="mt-4 font-medium">до 5 000 руб. в месяц</p>
                    <p className="text-sm text-muted-foreground">Ожидается: январь-2026</p>
                    <a href="#" className="mt-4 inline-block text-lg font-medium text-primary hover:underline">В предзапись &rarr;</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* СЕКЦИЯ: АНТИКРИЗИСНАЯ КНИГА */}
        <section id="book" className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
          <h2 className="text-4xl font-bold tracking-tight md:text-6xl">Антикризисная книга</h2>
          
          {/* Обложка книги */}
          <div className="mt-12 mb-8 mx-auto max-w-sm">
            <img 
              src={bookCover} 
              alt="Антикризисная книга - обложка" 
              className="w-full rounded-xl shadow-2xl"
            />
          </div>

          <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted-foreground md:text-xl">
            <p>В каком случае эта книга действительно поможет?</p>
            <p>Ты столкнулся с одним из видов кризиса реализации — я выделяю 6 основных: нет денег, выгорание, кризис с соцсетями, кризис быстрого роста, кризис смыслов, падение результатов и репутации.</p>
            <p>Если произошло что-то из этого, и нужен спасательный круг, это он и есть. Хватайся. Он не только поможет тебе выбраться из воды, но и поможет увидеть в кризисе новые возможности. Ведь после каждого кризиса я росла.</p>
            <p className="font-medium text-foreground">Приятного чтения и успешного выхода из турбулентности!</p>
          </div>
          <Button className="mt-12" size="lg">
            Читать бесплатно
          </Button>
        </section>

        {/* СЕКЦИЯ: EMAIL ПОДПИСКА */}
        <section id="newsletter" className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">История любви и первых больших денег</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Подпишитесь на e-mail рассылку. Каждый день в 9:00 по мск получайте по 1 части истории от Мари Афониной.
          </p>

          <form action="#" method="POST" className="mt-12 mx-auto max-w-md">
            <div className="flex flex-col gap-4 sm:flex-row">
              <label htmlFor="email-address" className="sr-only">E-mail</label>
              <input 
                type="email" 
                name="email-address" 
                id="email-address" 
                autoComplete="email" 
                required 
                className="flex-1 rounded-lg border border-input bg-background px-5 py-3 text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" 
                placeholder="Ваш e-mail"
              />
              <Button type="submit" className="sm:w-auto">
                Подписаться
              </Button>
            </div>
          </form>
        </section>

        {/* СЕКЦИЯ: FAQ */}
        <section id="faq" className="bg-muted/30">
          <div className="mx-auto max-w-3xl px-6 py-24 md:py-32">
            <h2 className="text-center text-4xl font-bold tracking-tight md:text-6xl">Частые вопросы</h2>
            
            <div className="mt-16 max-w-2xl mx-auto space-y-6">
              <details className="group border-b border-border pb-4">
                <summary className="flex list-none cursor-pointer items-center justify-between py-2 text-lg font-medium">
                  Что такое "Масштаб" и "ДОМ"?
                  <span className="ml-4 transform transition-transform duration-200 group-open:rotate-180">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                </summary>
                <div className="pt-4 text-base text-muted-foreground leading-relaxed">
                  Это мои ключевые образовательные и IT-проекты. "Масштаб" — флагманский курс по запускам и продюсированию. "ДОМ" — это платформа и комьюнити по подписке для онлайн-продаж.
                </div>
              </details>

              <details className="group border-b border-border pb-4">
                <summary className="flex list-none cursor-pointer items-center justify-between py-2 text-lg font-medium">
                  Для кого подходит ваше обучение?
                  <span className="ml-4 transform transition-transform duration-200 group-open:rotate-180">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                </summary>
                <div className="pt-4 text-base text-muted-foreground leading-relaxed">
                  Мои программы созданы для онлайн-предпринимателей, продюсеров и экспертов, которые хотят систематизировать свои продажи, выйти на новые доходы и масштабировать свой бизнес без огромных бюджетов на маркетинг.
                </div>
              </details>

              <details className="group border-b border-border pb-4">
                <summary className="flex list-none cursor-pointer items-center justify-between py-2 text-lg font-medium">
                  Как получить вашу "Антикризисную книгу"?
                  <span className="ml-4 transform transition-transform duration-200 group-open:rotate-180">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                </summary>
                <div className="pt-4 text-base text-muted-foreground leading-relaxed">
                  Вы можете найти ссылку на бесплатное чтение книги в соответствующем разделе этого сайта или по ссылке, которую я публикую в своих социальных сетях.
                </div>
              </details>

              <details className="group border-b border-border pb-4">
                <summary className="flex list-none cursor-pointer items-center justify-between py-2 text-lg font-medium">
                  Вы консультируете лично?
                  <span className="ml-4 transform transition-transform duration-200 group-open:rotate-180">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                </summary>
                <div className="pt-4 text-base text-muted-foreground leading-relaxed">
                  В данный момент фокус на групповых программах и развитии IT-платформы. Информацию о редких возможностях личной работы я публикую в своем телеграм-канале.
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* СЕКЦИЯ: КОНТАКТЫ */}
        <section id="contacts" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <h2 className="text-center text-4xl font-bold tracking-tight md:text-6xl">Контакты и ссылки</h2>

          <div className="mt-16 grid grid-cols-1 gap-12 border-t border-border pt-16 md:grid-cols-3 md:gap-8 md:text-left text-center">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Ссылки на соцсети</h4>
              <div className="mt-4 flex flex-col space-y-3">
                <a href="https://t.me/mari_zapuski" target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-primary transition-colors">Телеграм-канал: mari_zapuski</a>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">Личный телеграм-канал: mari_vse</a>
                <a href="https://t.me/mari_vakansii" target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-primary transition-colors">Чат вакансий в онлайне: mari_vakansii</a>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">Чат вакансий в ИИ: vakansii_chatgpt</a>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">Инстаграм: mariafonina</a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Контакты для связи</h4>
              <div className="mt-4 flex flex-col space-y-3">
                <a href="mailto:zapusk@mariafonina.ru" className="text-foreground/70 hover:text-primary transition-colors">E-mail (по любым вопросам): zapusk@mariafonina.ru</a>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">Служба заботы: @mashtab_sherif</a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Сотрудничество</h4>
              <div className="mt-4 flex flex-col space-y-3">
                <a href="mailto:zapusk@mariafonina.ru" className="text-foreground/70 hover:text-primary transition-colors">zapusk@mariafonina.ru</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ФУТЕР */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Мари Афонина. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
