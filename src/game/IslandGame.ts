import Phaser from 'phaser'
import { SPOTS, PLOTS } from '../data/island'

// ── Tile constants ──────────────────────────────────────────────────────────
const TS = 48        // tile size in pixels
const MAP_W = 20
const MAP_H = 14
const SPEED = 150
const INTERACT_DIST = 60

const T = { WATER: 0, SAND: 1, GRASS: 2, PATH: 3, TREE: 4, FLOWER: 5 } as const

const TILE_COLOR: Record<number, number> = {
  [T.WATER]:  0x3e7ec9,
  [T.SAND]:   0xe8c87a,
  [T.GRASS]:  0x6ab44e,
  [T.PATH]:   0xc49455,
  [T.TREE]:   0x4a9640,
  [T.FLOWER]: 0x7ed55a,
}

// prettier-ignore
const MAP: number[][] = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,4,2,2,2,2,2,2,2,2,2,4,2,2,2,1,0],
  [0,1,2,2,2,3,3,3,3,3,3,3,3,3,3,3,2,2,1,0],
  [0,1,2,2,2,3,2,2,2,2,2,2,2,2,2,3,2,2,1,0],
  [0,1,2,2,4,3,2,2,2,2,2,2,2,2,2,3,2,4,1,0],
  [0,1,2,2,2,3,2,2,2,2,2,2,2,2,2,3,2,2,1,0],
  [0,1,2,2,2,3,2,2,5,5,5,2,2,2,2,3,2,2,1,0],
  [0,1,2,2,4,3,2,2,5,5,5,2,2,4,2,3,2,2,1,0],
  [0,1,2,2,2,3,2,2,5,5,5,2,2,2,2,3,2,2,1,0],
  [0,1,2,2,2,3,3,3,3,3,3,3,3,3,3,3,2,2,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
]

// Rectangular path loop: top row 4, bottom row 11, left col 5, right col 15

// Spot tile positions on the map
const SPOT_TILE: Record<string, [number, number]> = {
  beach:      [5,  11],
  bakery:     [5,  7],
  garden:     [9,  9],
  lighthouse: [15, 4],
  library:    [15, 11],
}

// Plot tile positions
const PLOT_TILE: Record<string, [number, number]> = {
  farm:     [8,  6],
  market:   [12, 8],
  fountain: [10, 10],
}

// NPC emoji per spot
const SPOT_EMOJI: Record<string, string> = {
  beach:      '🦊',
  bakery:     '🐭',
  garden:     '🐰',
  lighthouse: '🦉',
  library:    '📚',
}

// ── Callbacks ───────────────────────────────────────────────────────────────
export interface IslandGameCallbacks {
  onSpotActivate: (id: string) => void
  onPlotActivate: (id: string) => void
  getSpotState: (id: string) => string
  getBuiltPlots: () => string[]
}

// ── Phaser Scene ────────────────────────────────────────────────────────────
class IslandScene extends Phaser.Scene {
  private cb: IslandGameCallbacks
  private player!: Phaser.Physics.Arcade.Sprite
  private walls!: Phaser.Physics.Arcade.StaticGroup
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>
  private npcMap = new Map<string, Phaser.GameObjects.Text>()
  private interactBubble!: Phaser.GameObjects.Container
  private nearbyId: string | null = null
  private dragStart: { x: number; y: number } | null = null
  private touchVel = { x: 0, y: 0 }

  constructor(cb: IslandGameCallbacks) {
    super({ key: 'Island' })
    this.cb = cb
  }

  preload() {
    // Generate player texture: cute round purple character matching app theme
    const g = this.make.graphics({ x: 0, y: 0 })
    g.fillStyle(0x7c5cbf)
    g.fillCircle(18, 16, 16)
    g.fillStyle(0xffffff, 1)
    g.fillCircle(18, 16, 10)
    g.fillStyle(0x7c5cbf)
    g.fillCircle(18, 16, 5)
    // Ears
    g.fillStyle(0x6a4aaa)
    g.fillTriangle(6, 5, 13, 1, 14, 10)
    g.fillTriangle(30, 5, 23, 1, 22, 10)
    // Eyes
    g.fillStyle(0x2d2438)
    g.fillCircle(13, 13, 2.5)
    g.fillCircle(23, 13, 2.5)
    // Blush
    g.fillStyle(0xff8c42, 0.6)
    g.fillCircle(10, 18, 3)
    g.fillCircle(26, 18, 3)
    g.generateTexture('player', 36, 36)
    g.destroy()
  }

  create() {
    const W = MAP_W * TS
    const H = MAP_H * TS

    // ── Draw tile base ─────────────────────────────────────────────
    const gfx = this.add.graphics()
    for (let r = 0; r < MAP_H; r++) {
      for (let c = 0; c < MAP_W; c++) {
        const t = MAP[r][c]
        const x = c * TS
        const y = r * TS
        gfx.fillStyle(TILE_COLOR[t])
        gfx.fillRect(x, y, TS, TS)
        // Tile detail
        if (t === T.GRASS) {
          gfx.fillStyle(0x4d9439, 0.22)
          gfx.fillRect(x + 4, y + 4, 10, 10)
          gfx.fillRect(x + 30, y + 30, 8, 8)
        } else if (t === T.WATER) {
          gfx.fillStyle(0x6baee0, 0.35)
          gfx.fillRect(x + 6, y + 16, 36, 4)
          gfx.fillRect(x + 4, y + 30, 24, 3)
        } else if (t === T.PATH) {
          gfx.fillStyle(0xa07040, 0.25)
          gfx.fillRect(x + 2, y + 22, 44, 2)
          gfx.fillRect(x + 18, y + 4, 2, 40)
        } else if (t === T.SAND) {
          gfx.fillStyle(0xd4a84e, 0.2)
          gfx.fillRect(x + 8, y + 8, 14, 14)
          gfx.fillRect(x + 28, y + 26, 10, 10)
        }
      }
    }
    gfx.setDepth(0)

    // ── Decorative emoji tiles ─────────────────────────────────────
    const flowerVariants = ['🌸', '🌺', '🌷']
    for (let r = 0; r < MAP_H; r++) {
      for (let c = 0; c < MAP_W; c++) {
        const t = MAP[r][c]
        if (t === T.TREE) {
          this.add.text(c * TS + TS / 2, r * TS + TS / 2, '🌲', { fontSize: '40px' })
            .setOrigin(0.5, 0.65).setDepth(2)
        } else if (t === T.FLOWER) {
          const f = flowerVariants[(r * 7 + c * 3) % 3]
          this.add.text(c * TS + TS / 2, r * TS + TS / 2, f, { fontSize: '28px' })
            .setOrigin(0.5).setDepth(1)
        }
      }
    }

    // Ambient water shimmer text
    for (let c = 1; c < MAP_W - 1; c++) {
      this.add.text(c * TS + TS / 2, TS * 0.5, '～', { fontSize: '18px', color: '#ffffff50' })
        .setOrigin(0.5).setDepth(0)
      this.add.text(c * TS + TS / 2, (MAP_H - 1) * TS + TS / 2, '～', { fontSize: '18px', color: '#ffffff50' })
        .setOrigin(0.5).setDepth(0)
    }

    // ── Collision walls ────────────────────────────────────────────
    this.walls = this.physics.add.staticGroup()
    for (let r = 0; r < MAP_H; r++) {
      for (let c = 0; c < MAP_W; c++) {
        const t = MAP[r][c]
        if (t === T.WATER || t === T.TREE) {
          const w = this.walls.create(c * TS + TS / 2, r * TS + TS / 2) as Phaser.Physics.Arcade.Sprite
          w.setVisible(false).setSize(TS, TS)
          w.refreshBody()
        }
      }
    }

    // ── NPCs & plots ───────────────────────────────────────────────
    this.spawnCharacters()

    // ── Interact bubble ────────────────────────────────────────────
    const bubbleBg = this.add.rectangle(0, 0, 110, 30, 0x1a1a2e, 0.85).setOrigin(0.5)
    const bubbleTxt = this.add.text(0, 0, '💬 走近对话', { fontSize: '13px', color: '#fff' }).setOrigin(0.5)
    this.interactBubble = this.add.container(0, 0, [bubbleBg, bubbleTxt])
      .setDepth(50).setVisible(false)

    // ── Player sprite ──────────────────────────────────────────────
    const [stx, sty] = SPOT_TILE.beach
    this.player = this.physics.add.sprite((stx + 1) * TS + TS / 2, sty * TS + TS / 2, 'player')
    this.player.setCollideWorldBounds(true).setDepth(15).setSize(26, 26)
    this.physics.add.collider(this.player, this.walls)

    // ── Camera ────────────────────────────────────────────────────
    this.physics.world.setBounds(0, 0, W, H)
    this.cameras.main.setBounds(0, 0, W, H)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)

    // ── Keyboard input ────────────────────────────────────────────
    this.cursors = this.input.keyboard!.createCursorKeys()
    const kb = this.input.keyboard!
    this.wasd = {
      up:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }
    kb.on('keydown-SPACE', () => this.doInteract())
    kb.on('keydown-E',     () => this.doInteract())

    // ── Touch / pointer ───────────────────────────────────────────
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.dragStart = { x: p.x, y: p.y }
      this.touchVel = { x: 0, y: 0 }
    })
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!p.isDown || !this.dragStart) return
      const dx = p.x - this.dragStart.x
      const dy = p.y - this.dragStart.y
      const len = Math.hypot(dx, dy)
      if (len > 14) this.touchVel = { x: (dx / len) * SPEED, y: (dy / len) * SPEED }
      else this.touchVel = { x: 0, y: 0 }
    })
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      const moved = Math.hypot(
        p.x - (this.dragStart?.x ?? p.x),
        p.y - (this.dragStart?.y ?? p.y),
      ) > 14
      this.dragStart = null
      this.touchVel = { x: 0, y: 0 }
      if (!moved && this.nearbyId) this.doInteract()
    })
  }

  private spawnCharacters() {
    const built = this.cb.getBuiltPlots()

    for (const spot of SPOTS) {
      const pos = SPOT_TILE[spot.id]
      if (!pos) continue
      const [tx, ty] = pos
      const px = tx * TS + TS / 2
      const py = ty * TS + TS / 2
      const state = this.cb.getSpotState(spot.id)
      this.placeNPC(spot.id, 'spot', px, py, SPOT_EMOJI[spot.id] ?? '❓', spot.nameZh, state)
    }

    for (const plot of PLOTS) {
      const pos = PLOT_TILE[plot.id]
      if (!pos) continue
      const [tx, ty] = pos
      const px = tx * TS + TS / 2
      const py = ty * TS + TS / 2
      const isBuilt = built.includes(plot.id)
      this.placePlot(plot.id, px, py, plot.emoji, plot.residentEmoji, plot.nameZh, isBuilt)
    }
  }

  private placeNPC(id: string, _type: 'spot', px: number, py: number, emoji: string, nameZh: string, state: string) {
    const isLocked = state === 'locked'
    const alpha = isLocked ? 0.4 : 1

    // Glow ring
    this.add.arc(px, py, 24, 0, 360, false, 0xffffff, isLocked ? 0.08 : 0.2).setDepth(4)

    // Emoji sprite
    const icon = this.add.text(px, py, isLocked ? '🔒' : emoji, { fontSize: '34px' })
      .setOrigin(0.5).setDepth(5).setAlpha(alpha)

    // Name tag
    const label = isLocked ? '???' : nameZh
    const tagStyle = { fontSize: '11px', color: '#fff', backgroundColor: isLocked ? '#88000088' : '#00000088', padding: { x: 4, y: 2 } }
    this.add.text(px, py - 40, label, tagStyle).setOrigin(0.5).setDepth(5).setAlpha(alpha)

    // "今日" badge for active spot
    if (state === 'today') {
      this.add.text(px + 16, py - 20, '✨', { fontSize: '16px' }).setOrigin(0.5).setDepth(6)
    }

    if (!isLocked) this.npcMap.set(id, icon)
  }

  private placePlot(id: string, px: number, py: number, buildEmoji: string, residentEmoji: string, nameZh: string, built: boolean) {
    if (!built) {
      this.add.text(px, py, buildEmoji, { fontSize: '30px' }).setOrigin(0.5).setDepth(3).setAlpha(0.25)
      this.add.text(px, py - 32, '🔨 建造', { fontSize: '10px', color: '#fff8', backgroundColor: '#0006', padding: { x: 3, y: 2 } })
        .setOrigin(0.5).setDepth(3).setAlpha(0.5)
      return
    }
    this.add.arc(px, py, 24, 0, 360, false, 0xffffff, 0.15).setDepth(4)
    const icon = this.add.text(px, py, `${buildEmoji}${residentEmoji}`, { fontSize: '28px' }).setOrigin(0.5).setDepth(5)
    this.add.text(px, py - 40, nameZh, { fontSize: '11px', color: '#fff', backgroundColor: '#00000088', padding: { x: 4, y: 2 } })
      .setOrigin(0.5).setDepth(5)
    this.npcMap.set(id, icon)
  }

  private doInteract() {
    if (!this.nearbyId) return
    const isPlot = PLOTS.some((p) => p.id === this.nearbyId)
    if (isPlot) this.cb.onPlotActivate(this.nearbyId)
    else this.cb.onSpotActivate(this.nearbyId)
  }

  update() {
    const body = this.player.body as Phaser.Physics.Arcade.Body
    let vx = 0, vy = 0

    if (this.cursors.left.isDown  || this.wasd.left.isDown)  vx = -SPEED
    else if (this.cursors.right.isDown || this.wasd.right.isDown) vx = SPEED
    if (this.cursors.up.isDown   || this.wasd.up.isDown)   vy = -SPEED
    else if (this.cursors.down.isDown || this.wasd.down.isDown) vy = SPEED

    // Touch overrides keyboard
    if (this.touchVel.x !== 0 || this.touchVel.y !== 0) {
      vx = this.touchVel.x
      vy = this.touchVel.y
    }

    // Normalize diagonal
    if (vx !== 0 && vy !== 0) {
      const f = SPEED / Math.hypot(vx, vy)
      vx *= f; vy *= f
    }

    body.setVelocity(vx, vy)
    if (vx < 0) this.player.setFlipX(true)
    else if (vx > 0) this.player.setFlipX(false)

    // Subtle walk bob
    if (Math.abs(vx) > 0 || Math.abs(vy) > 0) {
      this.player.y += Math.sin(this.time.now / 190) * 0.35
    }

    // ── Proximity detection ──────────────────────────────────────
    const px = this.player.x, py = this.player.y
    let found: { id: string; x: number; y: number } | null = null

    for (const [id, icon] of this.npcMap) {
      const d = Phaser.Math.Distance.Between(px, py, icon.x, icon.y)
      if (d < INTERACT_DIST) { found = { id, x: icon.x, y: icon.y }; break }
    }

    if (found) {
      this.nearbyId = found.id
      this.interactBubble.setPosition(found.x, found.y - 62).setVisible(true)
    } else {
      this.nearbyId = null
      this.interactBubble.setVisible(false)
    }
  }
}

// ── Public wrapper ──────────────────────────────────────────────────────────
export class IslandGame {
  private g: Phaser.Game

  constructor(container: HTMLElement, callbacks: IslandGameCallbacks) {
    this.g = new Phaser.Game({
      type: Phaser.AUTO,
      parent: container,
      backgroundColor: '#3e7ec9',
      scene: [new IslandScene(callbacks)],
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 }, debug: false },
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%',
      },
      audio: { noAudio: true },
    })
  }

  pause() { this.g.scene.getScene('Island')?.scene.pause() }
  resume() { this.g.scene.getScene('Island')?.scene.resume() }
  destroy() { this.g.destroy(true) }
}
