import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { MainNavigation } from "@/components/MainNavigation";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { usePageView, trackButtonClick, trackFunnelEvent } from "@/hooks/useAnalytics";
import mariPhoto from "@/assets/mari-photo.jpeg";
import bookCover from "@/assets/book-cover.png";
import logoSber from "@/assets/logo-sber.png";
import logoHse from "@/assets/logo-hse.png";
import logoRosatom from "@/assets/logo-rosatom.png";
import logoDetiBabochki from "@/assets/logo-deti-babochki.png";
import logoMgu from "@/assets/logo-mgu.png";
import logoNobelFest from "@/assets/logo-nobel-fest.png";
import logoRgsu from "@/assets/logo-rgsu.png";
import logoUnesco from "@/assets/logo-unesco.png";
import logoRbk from "@/assets/logo-rbk.png";

export default function Profile() {
  usePageView(); // Трекинг просмотра страницы

  return (
    <div className="bg-background text-foreground">
      <Helmet>
        <title>Мари Афонина (Мария Галантер) | Курс Масштаб | Обучение Вайбкодингу</title>
        <meta name="description" content="Официальный сайт Мари Афониной (Мария Галантер) — создатель курса Масштаб по запускам и продюсированию. Обучение вайбкодингу, ЛАБС, антикризисная книга. 1.5 млрд руб. в запусках без бюджета на маркетинг, 14 000 студентов." />
        <meta name="keywords" content="Мари Афонина, Мария Галантер, Масштаб, курс Мари Афониной, обучение Мари Афониной, вайбкодинг, ЛАБС, антикризисная книга, mari_zapuski" />
        <link rel="canonical" href="https://mariafonina.com/" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mariafonina.com/" />
        <meta property="og:title" content="Мари Афонина (Мария Галантер) | Курс Масштаб | Обучение Вайбкодингу" />
        <meta property="og:description" content="Официальный сайт Мари Афониной — создатель курса Масштаб. Обучение вайбкодингу и ИИ. 1.5 млрд руб. в запусках, 14 000 студентов." />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Мари Афонина (Мария Галантер) | Курс Масштаб" />
        <meta name="twitter:description" content="Создатель курса Масштаб. Обучение вайбкодингу и ИИ. 1.5 млрд руб. в запусках." />
        
        {/* JSON-LD Structured Data - Enhanced for AI Crawlers */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Мари Афонина",
            "alternateName": ["Мария Галантер", "Mari Afonina"],
            "description": "Мари Афонина (Мария Галантер) — создатель образовательного курса Масштаб по запускам и продюсированию. Эксперт по вайбкодингу и применению искусственного интеллекта в бизнесе. Автор антикризисной книги для предпринимателей. Провела запуски на 1.5 млрд рублей, обучила более 14 000 студентов. Основатель образовательного проекта ЛАБС.",
            "url": "https://mariafonina.com",
            "image": mariPhoto,
            "jobTitle": "Создатель курса Масштаб, эксперт по вайбкодингу и запускам, основатель ЛАБС",
            "knowsAbout": [
              "Запуски инфопродуктов",
              "Продюсирование онлайн-курсов",
              "Вайбкодинг",
              "Искусственный интеллект в бизнесе",
              "Digital предпринимательство",
              "Масштабирование бизнеса",
              "Антикризисное управление",
              "Образовательные технологии"
            ],
            "alumniOf": {
              "@type": "Organization",
              "name": "МГУ",
              "description": "Московский государственный университет"
            },
            "hasOccupation": {
              "@type": "Occupation",
              "name": "Эксперт по запускам и вайбкодингу",
              "description": "Обучение предпринимателей методам запуска инфопродуктов, применению вайбкодинга и искусственного интеллекта"
            },
            "hasCredential": [
              {
                "@type": "EducationalOccupationalCredential",
                "credentialCategory": "Achievement",
                "description": "Провела запуски на сумму более 1.5 миллиарда рублей"
              },
              {
                "@type": "EducationalOccupationalCredential",
                "credentialCategory": "Achievement",
                "description": "Обучила более 14 000 студентов"
              }
            ],
            "founder": {
              "@type": "Organization",
              "name": "ЛАБС",
              "description": "Образовательный проект по вайбкодингу и искусственному интеллекту"
            },
            "creator": {
              "@type": "Course",
              "name": "Курс Масштаб",
              "description": "Образовательный курс по запускам и продюсированию от Мари Афониной",
              "provider": {
                "@type": "Person",
                "name": "Мари Афонина"
              }
            },
            "sameAs": [
              "https://t.me/mari_zapuski"
            ],
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://mariafonina.com"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": "Масштаб",
            "description": "Курс Мари Афониной (Марии Галантер) по запускам и продюсированию инфопродуктов. Обучение стратегиям масштабирования бизнеса, запуску онлайн-курсов и применению вайбкодинга.",
            "provider": {
              "@type": "Person",
              "name": "Мари Афонина",
              "alternateName": "Мария Галантер"
            },
            "teaches": [
              "Запуски инфопродуктов",
              "Продюсирование онлайн-курсов",
              "Масштабирование образовательного бизнеса",
              "Вайбкодинг",
              "Применение ИИ в запусках"
            ],
            "numberOfStudents": "14000+",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "1500000000",
              "ratingCount": "Сумма запусков в рублях"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Book",
            "name": "Антикризисная книга",
            "author": {
              "@type": "Person",
              "name": "Мари Афонина",
              "alternateName": "Мария Галантер"
            },
            "description": "Антикризисная книга для предпринимателей от Мари Афониной. Практические стратегии преодоления кризисных ситуаций в бизнесе.",
            "bookFormat": "EBook/Paperback",
            "genre": "Business, Entrepreneurship",
            "inLanguage": "ru",
            "audience": {
              "@type": "Audience",
              "audienceType": "Предприниматели, владельцы бизнеса"
            }
          })}
        </script>
      </Helmet>
      
      {/* ПРОГРЕСС-БАР */}
      <ProgressBar topOffset="top-16" />
      
      {/* НАВИГАЦИЯ */}
      <MainNavigation />

      <main className="pt-24">
        {/* СЕКЦИЯ: ОБО МНЕ */}
        <section id="about" className="mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
          <div className="mx-auto mb-6 h-32 w-32 rounded-full bg-muted shadow-md md:mb-8 md:h-40 md:w-40 overflow-hidden">
            <img src={mariPhoto} alt="Мари Афонина" className="h-full w-full object-cover" />
          </div>

          <h1 className="text-5xl font-bold tracking-tight md:text-7xl">Мари Афонина (Мария Галантер)</h1>
          <h2 className="mt-4 text-2xl text-muted-foreground md:text-3xl">продюсер, IT-предприниматель, создатель курса Масштаб</h2>
          
          {/* Цитата-миссия */}
          <div className="mx-auto mt-16 max-w-3xl animate-fade-in md:mt-20">
            <blockquote className="relative rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card/80 to-card/40 p-8 shadow-xl backdrop-blur-sm md:p-12">
              <div className="absolute -left-4 -top-4 text-6xl font-bold text-primary/30 md:text-7xl">«</div>
              <p className="relative text-lg leading-relaxed text-foreground md:text-xl md:leading-relaxed">
                Моя миссия — делать предпринимателей свободнее, а их работу легче. Уже 11 лет я тружусь в этом направлении. Моя большая цель — чтобы между человеком и его бизнесом не стояло никаких сложностей, больших затрат и нагрузки. Весь мой путь про то, что я уже для этого сделала и делаю. Добро пожаловать на мой личный сайт!
              </p>
              <div className="absolute -bottom-4 -right-4 text-6xl font-bold text-primary/30 md:text-7xl">»</div>
            </blockquote>
          </div>
          
          <div className="mt-24 text-left">
            <ul className="space-y-5 text-lg leading-relaxed text-muted-foreground md:text-xl">
              <li className="flex items-start gap-4">
                <span className="mt-2 h-3 w-3 flex-shrink-0 rounded-full bg-gradient-to-r from-primary to-accent"></span>
                <span>Cделала запусков больше чем на <span className="font-bold text-xl text-foreground">1,5 млрд руб. без бюджета</span> на маркетинг.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="mt-2 h-3 w-3 flex-shrink-0 rounded-full bg-gradient-to-r from-primary to-accent"></span>
                <span>Автор <span className="font-bold text-xl text-foreground">курса Масштаб</span> — самого масштабного курса по запускам и продюсированию с системой запусков «Масштаб», образовательная лицензия №Л035-01221-58/00204867.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="mt-2 h-3 w-3 flex-shrink-0 rounded-full bg-gradient-to-r from-primary to-accent"></span>
                <span>14 000 студентов длительных образовательных проектов: продюсеров и экспертов.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="mt-2 h-3 w-3 flex-shrink-0 rounded-full bg-gradient-to-r from-primary to-accent"></span>
                <span>Больше 100 000 человек прошли бесплатные онлайн-уроки по запускам образовательных проектов.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="mt-2 h-3 w-3 flex-shrink-0 rounded-full bg-gradient-to-r from-primary to-accent"></span>
                <span>Создатель чата Мари про вакансии (<span className="font-bold text-xl text-foreground">185 000 участников</span>).</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="mt-2 h-3 w-3 flex-shrink-0 rounded-full bg-gradient-to-r from-primary to-accent"></span>
                <span>Автор методологии и ex-амбассадор сервиса с искусственным интеллектом для маркетинга в соцсетях (сервис <span className="font-bold text-xl text-foreground">вышел в прибыль в первый же месяц работы</span>, привлекли 2000 довольных пользователей).</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="mt-2 h-3 w-3 flex-shrink-0 rounded-full bg-gradient-to-r from-primary to-accent"></span>
                <span>По образованию — преподаватель русского и литературы с переподготовкой на руководителя образовательной организации.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="mt-2 h-3 w-3 flex-shrink-0 rounded-full bg-gradient-to-r from-primary to-accent"></span>
                <span><span className="font-bold text-xl text-foreground">Мама двоих детей</span> (2 года и 8 лет), из многодетной семьи (8 своих детей и 5 приемных у родителей).</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="mt-2 h-3 w-3 flex-shrink-0 rounded-full bg-gradient-to-r from-primary to-accent"></span>
                <span>Создатель проекта Дом там, где мы — бот в телеграм, который помогает жителям приграничных территорий найти работу, деньги на переезд, жилье и волонтера для помощи (2024-2025).</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="mt-2 h-3 w-3 flex-shrink-0 rounded-full bg-gradient-to-r from-primary to-accent"></span>
                <span>Родилась 19.10.1992, Идеалист по MBTI, весы, генератор ⅓.</span>
              </li>
            </ul>
          </div>

          {/* Блок 5: Коллаборации */}
          <div className="mt-24 text-left md:mt-32">
            <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">Коллаборации и выступления Мари Афониной</h2>
            
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
              <div className="rounded-2xl bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-16 items-center justify-center">
                  <img src={logoSber} alt="Сбербанк" className="h-full w-auto object-contain" />
                </div>
                <p className="font-semibold">Сбербанк</p>
                <p className="mt-2 text-sm text-muted-foreground">Приглашенный спикер (корпоративный тренинг, выступление на онлайн-конференции Сбера)</p>
              </div>
              <div className="rounded-2xl bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-16 items-center justify-center">
                  <img src={logoHse} alt="ВШЭ" className="h-full w-auto object-contain" />
                </div>
                <p className="font-semibold">Высшая Школа Экономики</p>
                <p className="mt-2 text-sm text-muted-foreground">Урок для студентов по продюсированию</p>
              </div>
              <div className="rounded-2xl bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-16 items-center justify-center">
                  <img src={logoRosatom} alt="Росатом" className="h-full w-auto object-contain" />
                </div>
                <p className="font-semibold">Росатом</p>
                <p className="mt-2 text-sm text-muted-foreground">Наставник в проекте для вожатых (2021-2022)</p>
              </div>
              <div className="rounded-2xl bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-16 items-center justify-center">
                  <img src={logoDetiBabochki} alt="Фонд Дети-бабочки" className="h-full w-auto object-contain" />
                </div>
                <p className="font-semibold">Фонд «Дети-бабочки»</p>
                <p className="mt-2 text-sm text-muted-foreground">Спикер благотворительного форума</p>
              </div>
              <div className="rounded-2xl bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-16 items-center justify-center">
                  <img src={logoMgu} alt="МГУ" className="h-full w-auto object-contain" />
                </div>
                <p className="font-semibold">МГУ</p>
                <p className="mt-2 text-sm text-muted-foreground">Организатор набора студентов и обучения от академиков МГУ (2023-2024)</p>
              </div>
              <div className="rounded-2xl bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-16 items-center justify-center">
                  <img src={logoNobelFest} alt="Nobel Fest" className="h-full w-auto object-contain" />
                </div>
                <p className="font-semibold">Нобель фест</p>
                <p className="mt-2 text-sm text-muted-foreground">Приглашенный участник (2023)</p>
              </div>
              <div className="rounded-2xl bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-16 items-center justify-center">
                  <img src={logoRgsu} alt="РГСУ" className="h-full w-auto object-contain" />
                </div>
                <p className="font-semibold">РГСУ</p>
                <p className="mt-2 text-sm text-muted-foreground">Соавтор учебного пособия по маркетингу (2024)</p>
              </div>
              <div className="rounded-2xl bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-16 items-center justify-center">
                  <img src={logoUnesco} alt="UNESCO" className="h-full w-auto object-contain" />
                </div>
                <p className="font-semibold">Юнеско</p>
                <p className="mt-2 text-sm text-muted-foreground">Участник съезда по бизнес-образованию (2024)</p>
              </div>
              <div className="rounded-2xl bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-16 items-center justify-center">
                  <img src={logoRbk} alt="РБК" className="h-full w-auto object-contain" />
                </div>
                <p className="font-semibold">РБК</p>
                <p className="mt-2 text-sm text-muted-foreground">Лидер рейтинга онлайн-школ с крупнейшей выручкой за квартал (2021)</p>
              </div>
            </div>
          </div>
        </section>

        {/* СЕКЦИЯ: ПРОЕКТЫ */}
        <section id="projects" className="bg-muted/30">
          <div className="mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
            <h2 className="text-4xl font-bold tracking-tight md:text-6xl">Проекты Мари Афониной</h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground md:text-xl">
              Все проекты Мари Афониной отвечают одной миссии: помогать онлайн-предпринимателям стать свободными и прибыльными. Обучение вайбкодингу, курс Масштаб, антикризисная книга — все для упрощения работы между предпринимателем и клиентом.
            </p>

            <div className="mt-16 space-y-12">
              {/* Раздел "Сейчас в продаже" */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Сейчас в продаже</h3>
                <div className="mt-6 rounded-2xl bg-card p-8 text-left shadow-lg">
                  <h3 className="text-2xl font-bold">ЛАБС — обучение вайбкодингу от Мари Афониной</h3>
                  <p className="mt-3 text-lg text-muted-foreground">Проект по обучению искусственному интеллекту и вайбкодингу. Научитесь создавать приложения с помощью ИИ.</p>
                  <p className="mt-6 font-medium">Стоимость: 33 300 руб.</p>
                  <p className="text-sm text-muted-foreground">Пройдет: 2-23 ноября</p>
                  <Button 
                    asChild 
                    variant="gradient" 
                    className="mt-6"
                  >
                    <a 
                      href="https://labs.mashtab.io?utm_source=main_site_mari" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => {
                        trackButtonClick('Занять место ЛАБС', 'purchase');
                        trackFunnelEvent('click_labs_purchase', { offer: 'LABS' });
                      }}
                    >
                      Занять место
                    </a>
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* СЕКЦИЯ: АНТИКРИЗИСНАЯ КНИГА */}
        <section id="book" className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
          <h2 className="text-4xl font-bold tracking-tight md:text-6xl">Антикризисная книга Мари Афониной</h2>
          
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
          <Button asChild className="mt-12" size="lg">
            <a href="https://t.me/mari_zapuski/599" target="_blank" rel="noopener noreferrer">Читать бесплатно</a>
          </Button>
        </section>

        {/* СЕКЦИЯ: ССЫЛКИ НА СОЦСЕТИ */}
        <section id="social" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl mb-16">Ссылки на соцсети</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <a href="https://t.me/mari_zapuski" target="_blank" rel="noopener noreferrer" className="rounded-3xl bg-card p-8 shadow-sm transition-all hover:shadow-md">
              <h3 className="text-xl font-semibold mb-3">Телеграм-канал</h3>
              <p className="text-2xl font-bold mb-2">@mari_zapuski</p>
              <p className="text-muted-foreground">Основной канал о запусках</p>
            </a>

            <a href="https://t.me/mari_vse" target="_blank" rel="noopener noreferrer" className="rounded-3xl bg-card p-8 shadow-sm transition-all hover:shadow-md">
              <h3 className="text-xl font-semibold mb-3">Личный телеграм-канал</h3>
              <p className="text-2xl font-bold mb-2">@mari_vse</p>
              <p className="text-muted-foreground">Личные мысли и инсайты</p>
            </a>

            <a href="https://t.me/mari_vakansii" target="_blank" rel="noopener noreferrer" className="rounded-3xl bg-card p-8 shadow-sm transition-all hover:shadow-md">
              <h3 className="text-xl font-semibold mb-3">Чат вакансий в онлайне</h3>
              <p className="text-2xl font-bold mb-2">@mari_vakansii</p>
              <p className="text-muted-foreground">185 000 участников</p>
            </a>

            <a href="https://t.me/vakansii_chatgpt" target="_blank" rel="noopener noreferrer" className="rounded-3xl bg-card p-8 shadow-sm transition-all hover:shadow-md">
              <h3 className="text-xl font-semibold mb-3">Чат вакансий в ИИ</h3>
              <p className="text-2xl font-bold mb-2">@vakansii_chatgpt</p>
              <p className="text-muted-foreground">Вакансии в сфере AI</p>
            </a>

            <a href="https://www.instagram.com/mariafonina/" target="_blank" rel="noopener noreferrer" className="rounded-3xl bg-card p-8 shadow-sm transition-all hover:shadow-md md:col-span-1">
              <h3 className="text-xl font-semibold mb-3">Инстаграм</h3>
              <p className="text-2xl font-bold mb-2">@mariafonina</p>
              <p className="text-muted-foreground">Визуальный контент</p>
            </a>
          </div>
        </section>

        {/* СЕКЦИЯ: КОНТАКТЫ */}
        <section id="contacts" className="bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl mb-16">Контакты для связи</h2>

            <div className="space-y-6">
              <div className="rounded-3xl bg-card p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">По любым вопросам</p>
                  <h3 className="text-2xl font-bold mb-2">E-mail</h3>
                  <p className="text-xl">zapusk@mariafonina.ru</p>
                </div>
              </div>

              <div className="rounded-3xl bg-card p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">По любым вопросам</p>
                  <h3 className="text-2xl font-bold mb-2">Служба заботы</h3>
                  <p className="text-xl">@mashtab_sherif</p>
                </div>
                <Button asChild size="lg" className="md:min-w-[200px]" onClick={() => trackButtonClick('Служба заботы', 'contact')}>
                  <a href="https://t.me/mashtab_sherif" target="_blank" rel="noopener noreferrer">Связаться</a>
                </Button>
              </div>

              <div className="rounded-3xl bg-card p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">С вопросами по покупке проектов</p>
                  <h3 className="text-2xl font-bold mb-2">Whatsapp менеджера продаж</h3>
                  <p className="text-xl">Консультация по продуктам</p>
                </div>
                <Button 
                  asChild 
                  size="lg" 
                  className="md:min-w-[200px]"
                  onClick={() => trackButtonClick('WhatsApp менеджера продаж', 'contact')}
                >
                  <a href="https://wa.me/79003192155?text=Узнать%20про%20услуги%20Мари" target="_blank" rel="noopener noreferrer">Связаться</a>
                </Button>
              </div>

              <div className="rounded-3xl bg-card p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Для партнеров</p>
                  <h3 className="text-2xl font-bold mb-2">Сотрудничество</h3>
                  <p className="text-xl">@mashtab_sherif</p>
                </div>
                <Button asChild size="lg" className="md:min-w-[200px]" onClick={() => trackButtonClick('Сотрудничество', 'contact')}>
                  <a href="https://t.me/mashtab_sherif" target="_blank" rel="noopener noreferrer">Связаться</a>
                </Button>
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
