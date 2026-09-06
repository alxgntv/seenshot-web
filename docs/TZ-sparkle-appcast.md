# ТЗ: фид автообновлений SeenShot

<!-- ─── Ariadne's Thread [AT-0366] ─────────────────────
  What: Canonical Sparkle feed is https://seenshot.app/appcast.xml
  Why:  updates.seenshot.com is off the Worker; the Mac SUFeedURL is the .app host
  Date: 2026-08-28
  Related: [AT-0364] src/index.ts:proxySparkleAppcast, [AT-0364] app→Info.plist:SUFeedURL
─────────────────────────────────────────────────────── -->

`https://seenshot.app/appcast.xml`

Репозиторий сайта: **seenshot-web** (Cloudflare Worker `seenshot-web`, домены `seenshot.app` и `www.seenshot.app`).

Документация:

- Sparkle, публикация appcast: https://sparkle-project.org/documentation/publishing/
- `fetch` в Worker: https://developers.cloudflare.com/workers/runtime-apis/fetch/
- Cache API: https://developers.cloudflare.com/workers/runtime-apis/cache/
- Wrangler `[assets]` + `run_worker_first`: https://developers.cloudflare.com/workers/wrangler/configuration/#assets

Не копировать XML в `public/`. Не придумывать второй CDN, второй инсталлятор, свой XML. `updates.seenshot.com` к Worker не привязан и для апдейтов не используется.

---

## 1. Цель

Уже установленные копии SeenShot для Mac сами узнают о новой версии. Sparkle делает GET на **ровно этот URL** (`Info.plist` / `SUFeedURL`):

```
https://seenshot.app/appcast.xml
```

Worker отдаёт **живой Sparkle appcast** (RSS XML): проксирует эталон с GitHub Pages. XML в `public/` не кладётся.

Проверка, карточка **A new update is available.**, кнопка **Update**, скачивание DMG и замена `.app` уже в приложении.

---

## 2. Как это устроено

1. Пользователь ставит приложение с https://seenshot.app (Download → GitHub Releases).
2. Sparkle качает `https://seenshot.app/appcast.xml`.
3. Сравнивает `sparkle:version` с `CFBundleVersion`.
4. Подпись enclosure проверяется `SUPublicEDKey` в приложении. Приватный ключ на сайт **не класть**.
5. DMG качается по URL внутри XML (GitHub Releases), не с сайта.

Эталонный XML собирает CI Mac-репозитория при теге `v*`:

- GitHub Pages: `https://alxgntv.github.io/seenshot/appcast.xml`
- git: `https://github.com/alxgntv/seenshot` файл `docs/appcast.xml`

После релиза GitHub Action коммитит `docs/appcast.xml` в `main`. Worker всегда `fetch` этот origin, а не копию в репозитории сайта.

Маршруты Worker: только `seenshot.app` и `www.seenshot.app`. Хост `updates.seenshot.com` с Worker снят.

---

## 3. Worker

Файл: `seenshot-web/src/index.ts`, `proxySparkleAppcast`.

**Первым делом** в `fetch` (до OAuth, кабинета, `env.ASSETS.fetch`):

| Метод | Путь | Ответ |
| --- | --- | --- |
| GET, HEAD | `/appcast.xml` | тело эталонного appcast, статус 200 |

Реализация (нативный `fetch`, без своего парсера RSS):

1. Origin: `https://alxgntv.github.io/seenshot/appcast.xml`.
2. Заголовки клиенту:
   - `Content-Type: application/xml; charset=utf-8`
   - `Cache-Control: public, max-age=300`
3. Если origin не 200 или тело не начинается с `<?xml` / `<rss` — `502` `text/plain`, лог на английском. Не проксировать HTML.
4. Логи на английском: host, path, origin status, bytes, cache hit/miss.
5. `run_worker_first = true`, чтобы `public/` не отдал 404 на `/appcast.xml`.
6. Не копировать `appcast.xml` в `public/`.

---

## 4. Запрещено

- Менять канонический URL фида на `updates.seenshot.com` или другой хост.
- Копировать `appcast.xml` в `public/`.
- Редактировать XML руками, переподписывать `sparkle:edSignature`, менять URL enclosure.
- Класть на сайт приватный EdDSA-ключ Sparkle.
- Хостить/подменять DMG на сайте (enclosure на GitHub Releases).
- Отдавать HTML лендинга на `/appcast.xml`.
- Привязывать `updates.seenshot.com` к этому Worker.
- Ломать OAuth, кабинет, share-страницы.

---

## 5. Приёмка

```bash
# 1. Не HTML
curl -sI https://seenshot.app/appcast.xml

# Ожидание:
# HTTP/2 200
# content-type: application/xml
# server: cloudflare

# 2. Тело — RSS Sparkle
curl -sL https://seenshot.app/appcast.xml | head -20

# В теле:
# <rss xmlns:sparkle=
# <sparkle:version>
# sparkle:edSignature=
# enclosure url=https://github.com/alxgntv/seenshot/releases/download/

# 3. Совпадает с эталоном
diff <(curl -sL https://seenshot.app/appcast.xml) \
     <(curl -sL https://alxgntv.github.io/seenshot/appcast.xml)

# 4. Лендинг жив
curl -sI https://seenshot.app | head -15
# HTTP 200, content-type: text/html
```

Готово, только если пункты 1–4 зелёные.

---

## 6. Корнеркейсы

1. **Положить XML в `public/`** — после следующего `v*` фид на сайте устареет. Только live `fetch` origin.
2. **Проксировать HTML origin** — Sparkle не обновит ни одну копию. Всегда проверять XML.
3. **`max-age` сутки+** — после релиза карточка Update доедет с задержкой. `max-age=300` достаточно.
4. **HEAD** — не отдавать 405 с HTML.
5. **`updates.seenshot.com`** — не фид. Старые сборки с этим `SUFeedURL` апдейт с `.app` не получат.
6. **Редирект на github.io без прокси** — приложение ждёт XML на `seenshot.app/appcast.xml`. Нужен 200 XML на этом URL.
7. **Лендинг `/` не должен стать XML** — ветка только `pathname === /appcast.xml`.
