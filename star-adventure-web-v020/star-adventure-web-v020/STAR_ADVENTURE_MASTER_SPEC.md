# STAR ADVENTURE --- MASTER SPEC

Version: Handoff 1.0 Current implementation baseline: Web Build 0.3.2
Language: Traditional Chinese (zh-TW)

## 0. PRIMARY INSTRUCTION --- DO NOT REDESIGN THIS GAME

This is an implementation task for an already-approved game design.

Use the supplied Build 0.3.2 as the technical baseline and implement the
complete Full Alpha. Do not delete, merge, reorder, replace, or simplify
the five approved levels or the ending. Do not substitute new mechanics
merely because they seem easier or better.

The first Full Alpha may use placeholder graphics, but Levels 1--5, the
birthday ending, Party Room, multiplayer flow, and DEV tools must be
genuinely playable. "Coming Soon" screens do not count as completed
levels.

Target milestone: **Star Adventure Full Alpha --- Levels 1--5 complete
and playable end-to-end.**

Priority: 1. Playability 2. Multiplayer synchronization 3. Complete
Levels 1--5 4. Birthday Ending 5. Reconnection stability 6. Art /
animation / audio polish

------------------------------------------------------------------------

# 1. PROJECT PURPOSE AND TONE

Temporary/main title: **《星星大冒險》**

This is a private, noncommercial browser co-op game made as a belated
birthday gift for a female gaming friend. The relationship is friendship
only. She has a boyfriend, so the tone must remain funny, friendly,
absurd, and non-romantic.

The birthday has already passed. The late delivery itself is part of the
final joke.

The first \~90% of the game should feel like a normal cute cooperative
adventure. Do **not** reveal that the game is a birthday gift until the
end of Level 5.

Visual direction: - Cute pastel 2D side-scrolling world. - Hand-drawn /
anime-like softness. - Peaceful-looking environments with absurd
hazards. - The intended final fan-art direction is inspired by the
Chiikawa world and characters for private use. - During Alpha,
placeholders are acceptable. Do not block gameplay implementation
waiting for final art.

------------------------------------------------------------------------

# 2. TARGET PLATFORM / MULTIPLAYER

-   Browser game.
-   PC and mobile users can join the same room.
-   True real-time multiplayer.
-   1--6 players supported for development/testing.
-   Intended party size: up to 6.
-   Short room code.
-   One player creates a room; friends join from their own devices.
-   No duplicate character selections.
-   External voice chat is assumed; no text-chat system is required.
-   Reconnection must preserve the player's identity and character where
    possible.
-   The player who selected 小桃 must retain birthday-target identity
    across disconnect/rejoin.

Controls:

PC: - A/D or Left/Right: move - Space: jump - E: interact - Q: emote

Mobile: - Left - Right - Jump - Interact - Emote

All characters use the same gameplay movement/statistics. Character
differences are cosmetic only.

Desired eventual animation states: - idle - run - jump - fall -
flattened/death - dizzy/cry/scared - happy - rescue teammate - victory -
emote

------------------------------------------------------------------------

# 3. CHARACTER SELECTION / BIRTHDAY TARGET

Selectable character pool: - 吉伊卡哇 - 小八 - 兔兔 - 小桃 - 栗子饅頭 -
海獺師傅 - 風獅爺 - 古本屋

More characters exist than room slots. Maximum six players per room.

**Critical rule:** the player who selects **小桃** automatically becomes
`momoPlayer` / `momoToken`, the hidden birthday target.

There must not be a second birthday-target selector.

Do not openly reveal this purpose in the lobby.

Small hidden foreshadowing is allowed, but it must not spoil the
birthday: - Example when 小桃 dies: `系統：這個人等等還有用，不能死。` -
NPCs may briefly stare at 小桃. Keep these subtle and simple.

------------------------------------------------------------------------

# 4. SHARED GAME SYSTEMS

Implement reusable systems rather than hardcoding each stage
independently where practical.

Required: - Stage manager / stage transitions - Server-authoritative or
robust synchronized stage state - Player movement synchronization -
Local responsive movement rendering - Remote-player interpolation -
Checkpoints - Falling / death - Funny, non-punitive death - \~3 second
respawn - No lives limit - Downed/flattened state where appropriate -
Teammate rescue: hold interact approximately 2 seconds - Pressure
plates - Switches / levers - Doors / gates - Moving platforms - Pushable
objects - Shared "all players gathered" checks - Stage clear state -
Fragment inventory/state - Reconnection - Host handling - DEV tools -
Mobile and desktop must use a consistent world-coordinate system

Networking/performance: - Do not broadcast the entire room state every
movement frame. - Movement packets should be lightweight. - Local
input/rendering should not wait for network round trips. - Prefer
requestAnimationFrame and delta-time-based movement. - Remote players
should be smoothed/interpolated. - Keep diagnostic capability for FPS /
ping / network update rate during development.

------------------------------------------------------------------------

# 5. LEVEL 1 --- 草原

Title: **「今天也要去工作！」**

Visual: - Bright grassland - Flowers - Hills - Small houses / cute
background elements

NPC: `今天的工作是把星星送到另一邊！`

Gameplay: - Basic movement tutorial - Easy jumps - Pits - Moving
planks/platforms

Primary co-op gate: - Three players must stand on three pressure
plates. - The other three pass through. - Players on the far side
activate/pull a mechanism so the remaining players can cross. - It must
feel like a real six-player cooperation mechanic, not merely "three
players anywhere inside one broad zone."

Bridge gag: - A bridge intentionally breaks around the fourth-player
crossing moment. - Funny fall. - Respawn/checkpoint, no harsh
punishment.

End: - All active adventurers must gather. - Award `⭐ 星星碎片①`.

Expected duration: \~3--4 minutes.

------------------------------------------------------------------------

# 6. LEVEL 2 --- 森林洞窟

Title: **「奇怪的洞穴」**

Visual: - Forest entrance transitioning into cave.

Structure: - Six players split into three pairs.

Puzzle 1: - One player sees a symbol sequence, for example:
`🌸 → ⭐ → 🍄 → 🌙` - Their paired teammate has corresponding buttons. -
They communicate through voice and enter the sequence. - Wrong answer
triggers a funny spring/explosion/`BOING` launch.

Puzzle 2: - Contradictory-looking clues. - Example: - Player A sees
`不要相信黃色` - Player B sees `藍色在說謊` - A third environmental clue
resolves the contradiction. - Design the actual puzzle so it is
understandable and synchronized.

All three pairs must solve their sections and regroup.

End: - Award `⭐ 星星碎片②`.

Expected duration: \~4--5 minutes.

------------------------------------------------------------------------

# 7. LEVEL 3 --- 工作區

Title: **「超級搬運工」**

NPC: `請把這個東西送到山頂。`

Core mechanic: - A giant round pink cargo/core. - Shared multiplayer
physics or convincing synchronized push behavior. - It can be pushed. -
It rolls. - It can fall. - It can flatten players in a funny way.

Sections:

1.  Slope

-   If players overpush, the cargo rolls back down.

2.  Seesaw

-   Some players use body weight / positioning while others move the
    cargo across.

3.  Giant fan

-   Three players hold pressure switches to stop the fan.
-   Remaining players move the cargo through.

Gag sign: `⚠️ 禁止乘坐貨物。` Players are nevertheless allowed to ride
the cargo.

End: - Cargo reaches destination. - Crate opens. - The apparent reward
is only a mushroom. - NPC says: `辛苦了!` - Then gives the real
fragment.

Award: `⭐ 星星碎片③`

Expected duration: \~5--6 minutes.

Important: Do not replace this with a different "teammates as stepping
stones" puzzle. The approved core gag is the cargo and "禁止乘坐貨物"
sign.

------------------------------------------------------------------------

# 8. LEVEL 4 --- 討伐 BOSS

Visual/tone: - Large cute monster. - Cute/dangerous contrast. - Avoid
turning this into complex conventional combat.

Core: Environmental co-op using three cannons / cannon setup.

Dynamic roles: - 1 player attracts the Boss. - 2 players activate
left/right mechanisms. - 2 players carry cannon ammunition. - 1 player
operates the cannon. - Roles can swap dynamically.

Boss attacks: - Charge - Jump / butt slam - Spit small mobs - Roar /
wind blast that knocks everyone away

Downed players: - Flattened / ghost-like. - Teammate holds interact
about 2 seconds to revive.

Victory mechanic: - Hit Boss with 3 cannon shots.

Fake-out: - Boss appears defeated. - Boss gets back up. - Music restarts
as if phase 2 is beginning. - Instead, Boss walks over to eat food. -
Boss sits down. - Boss spits/drops the fragment.

Award: `⭐ 星星碎片④`

Expected duration: \~5--7 minutes.

Do not replace the approved role structure with a different 2/2/1/1 role
breakdown unless it is only an internal implementation detail that
preserves the visible gameplay above.

------------------------------------------------------------------------

# 9. LEVEL 5 --- 星空之塔

Visual progression: - Sunset - Starry sky - Clouds / elevated tower
feeling

At the beginning: - No NPC.

Gameplay: Short remix versions of previous mechanics: - Pressure
plates - Paired clue - Push a star/object - Avoid monster/hazards

The four collected fragments fly into four sockets.

A central treasure chest rises.

System text: `需要所有冒險者。`

All players gather around it.

Every player's screen shows: `【一起打開】`

All players hold for approximately 3 seconds: `1…2…3…`

Then: - White flash - Black screen

This is where the birthday reveal begins.

------------------------------------------------------------------------

# 10. FINAL BIRTHDAY REVEAL

The reveal must happen only after Level 5.

Black screen: `冒險完成。`

Wait approximately 2 seconds.

Then: `……` `系統好像漏掉了什麼。`

Then: `⚠️ DELIVERY ERROR` `有一份物品嚴重延遲。`

Search / loading beat.

Then: `收件人：小桃`

The player who selected 小桃 is the target.

During the reveal: - 小桃 target is locked/non-interactive as needed. -
The other five players each see: `⭐【送出去】` - The target does
**not** see this send button. - Each of the five other players presses
independently. - Each sent star visibly flies toward 小桃's
screen/character. - Count/represent all five stars individually. - The
sequence must tolerate fewer human players during DEV testing via
bots/simulation, but preserve the intended six-player presentation.

When all five stars arrive: - Five stars merge. - Pastel party world
appears. - Fireworks. - Cake drops/appears. - Prior NPCs return. - Level
4 Boss returns wearing a birthday hat. - Characters celebrate/dance.

Main message: `🎂 HAPPY BELATED BIRTHDAY！` `小桃！`

Follow-up: `生日祝福傳送成功。` `延遲原因：製作人嚴重拖延。`

Hidden achievement: `《為了一句生日快樂，叫五個人陪妳闖了五關》`

Optional supporting jokes already approved as alternates/extras, not
replacements: - `我們終於想起了一件重要的事……` - `雖然好像有點晚了。` -
`……不是有點。` - Compensation: - `蛋糕 ×1` - `盟友 ×5` -
`遲到的禮物 ×1` - `精神損失賠償 ×0` - Possible title reveal:
`《星星大冒險：原來只是有人忘記準時送生日禮物》`

Do not silently replace the approved hidden achievement with newly
invented ending jokes.

------------------------------------------------------------------------

# 11. PARTY ROOM

After the birthday reveal: - Do not force players to quit. - Enter a
Party Room. - Players can run. - Jump. - Bump into each other. -
Emote. - Fireworks continue. - Cake / party decorations remain. - It
should function as a casual post-game hangout.

------------------------------------------------------------------------

# 12. MAIN MENU / PRODUCER PAGE

Main menu:

`《星星大冒險》`

Buttons: - 【建立房間】 - 【加入房間】 - 【遊戲說明】 - 【製作人】 -
【設定】

Producer page before completion: - 製作人：Ollie - 程式：Ollie ＆ AI -
美術協力：AI - 測試人員：製作人本人與一群假人 -
特別感謝：願意被騙進來玩的人 - 製作目的：？？？

After the game has been cleared: -
`製作目的：因為生日過了才想到要做生日禮物。`

The main title may unlock/change to: `《星星大冒險：遲到的生日禮物》`

Persist the local "cleared" state appropriately so reopening the game
can show the unlocked producer-page joke.

------------------------------------------------------------------------

# 13. DEV / TEST MODE

This is required from the Full Alpha, not postponed.

Host-only DEV controls should support: - Auto-add simple bots until room
has six players. - Bots follow host when appropriate. - Bots can occupy
pressure plates. - Bots can regroup for all-player checks. - Bots can
auto-interact when needed for testing. - Teleport all players/bots to
host. - Revive all. - Jump directly to Level 1. - Jump directly to Level
2. - Jump directly to Level 3. - Jump directly to Level 4. - Jump
directly to Level 5. - Grant all four fragments. - Ensure/simulate a
小桃 target. - Directly trigger Birthday Ending. - Where pair puzzles
require six humans, provide deterministic DEV assistance so one
developer can test the entire flow.

Bots do not need sophisticated AI. They are testing helpers.

------------------------------------------------------------------------

# 14. RECONNECTION / QA REQUIREMENTS

Important real-world test cases: - PC + mobile in same room. - Different
networks. - Mobile app/browser backgrounding. - Phone lock/unlock. -
Browser reload. - Wi-Fi ↔ mobile network change. - Disconnect/rejoin
during later stages. - Especially disconnect/rejoin of the 小桃 player
during Level 5. - `momoPlayer` identity must survive reconnection. -
Stage state must not reset unexpectedly because one client reconnects.

Before final delivery, one real remote tester plus bots is sufficient
for engineering QA. The actual birthday group may be the first full
six-human run.

------------------------------------------------------------------------

# 15. CURRENT BASELINE: BUILD 0.3.2

The supplied ZIP is the current technical baseline.

Known project stack: - Node.js - Express - HTTP - Socket.IO - Static
`public/index.html` - Render deployment - `/health` endpoint - Room
codes - localStorage player token for rejoin - character selection -
`momoToken` - host start - DEV bots - multiplayer movement - Level 1
prototype - performance work from 0.3 → 0.3.1 → 0.3.2

0.3.2 intent: - requestAnimationFrame-based smoother rendering -
delta-time movement - translate3d-style rendering - lightweight network
position updates - remote interpolation - unified world coordinates -
development diagnostics such as FPS / ping / network rate

Do not regress to the older architecture where every movement packet
broadcasts the entire room state.

The previous Level 1 implementation was only an early prototype. Full
Alpha should make Level 1 match the approved design above, including
proper pressure-plate cooperation, moving platforms, bridge gag,
checkpoint behavior, and shared systems.

------------------------------------------------------------------------

# 16. DEPLOYMENT

Target deployment: - Render web service. - Existing public site has been
used at `https://star-adventure.onrender.com`. - The repository
previously had an accidentally nested directory structure. Do not assume
the repository root; preserve a deployable package with `package.json`,
`server.js`, and `public/index.html` together in one clear project root
in the output ZIP.

Expected output: - One complete ZIP. - Can be extracted and deployed. -
Include a concise README with: - npm install - npm start - required
Render settings - build/version identifier - DEV controls - known
limitations, if any

------------------------------------------------------------------------

# 17. ART / IP IMPLEMENTATION NOTE

The creator wants the final private fan game to use
Chiikawa-inspired/Chiikawa character presentation and anime-like
backgrounds.

For the Alpha: - Mechanics and full end-to-end playability come first. -
Placeholder avatars and environment art are acceptable. - Structure the
game so final character sprites/background assets can later replace
placeholders without rewriting gameplay logic.

Do not spend the entire implementation budget on art before the five
levels and ending work.

------------------------------------------------------------------------

# 18. ACCEPTANCE CRITERIA FOR FULL ALPHA

The Full Alpha is considered complete only when:

-   A room can be created.
-   1--6 players can join.
-   Characters can be selected without duplicates.
-   小桃 correctly becomes hidden birthday target.
-   Host can start.
-   Level 1 is playable and awards fragment ①.
-   Level 2 is playable and awards fragment ②.
-   Level 3 is playable and awards fragment ③.
-   Level 4 is playable and awards fragment ④.
-   Level 5 is playable.
-   Four fragments are used in Level 5.
-   All-player chest interaction works.
-   Birthday reveal runs.
-   Five-star sending sequence works.
-   小桃 receives the reveal.
-   Party Room loads after reveal.
-   Producer-page post-clear text unlocks.
-   DEV jump/testing tools work.
-   Bots allow a single developer to reach and test every stage.
-   A disconnect/rejoin does not casually destroy the run.
-   Mobile and desktop remain compatible.
-   No stage is represented only by placeholder text saying it will be
    implemented later.

------------------------------------------------------------------------

# 19. HANDOFF PROMPT

When starting a fresh coding conversation/model, use this instruction:

> Read `STAR_ADVENTURE_MASTER_SPEC.md` completely and inspect the
> supplied Build 0.3.2 project before editing. This is an implementation
> task, not a redesign task. Preserve every locked story beat, level
> order, multiplayer rule, 小桃 birthday-target rule, ending sequence,
> producer-page joke, and DEV requirement in the spec. Build one
> complete Full Alpha containing Levels 1--5, Birthday Ending, Party
> Room, reconnection support, and DEV testing tools. Do not stop after
> one level and do not replace unfinished levels with "Coming Soon."
> Reuse and improve the existing 0.3.2 multiplayer/performance
> architecture instead of reverting it. When finished, output one
> deployable Render-ready ZIP and a short README. Prioritize functional
> end-to-end gameplay and multiplayer synchronization over final
> artwork.
