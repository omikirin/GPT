// Character class and initial character data
class Character {
    constructor(name, type, x, y, isEnemy = false) {
        this.name = name;
        this.type = type;
        this.x = x;
        this.y = y;
        this.maxHp = this.getMaxHp();
        this.hp = this.maxHp;
        this.maxMp = this.getMaxMp();
        this.mp = this.maxMp;
        this.attack = this.getAttack();
        this.defense = this.getDefense();
        this.range = this.getRange();
        this.movement = this.getMovement();
        this.isEnemy = isEnemy;
        this.hasActed = false;
        this.attackBoost = 0;
        this.attackBoostTurns = 0;
    }

    getMaxHp() {
        const hpMap = {
            'uka': 80, 'oto': 100, 'oen': 70, 'ninja': 60
        };
        return hpMap[this.type] || 50;
    }

    getMaxMp() {
        const mpMap = {
            'uka': 50, 'oto': 20, 'oen': 40, 'ninja': 30
        };
        return mpMap[this.type] || 20;
    }

    getAttack() {
        const attackMap = {
            'uka': 25, 'oto': 35, 'oen': 15, 'ninja': 30
        };
        return attackMap[this.type] || 20;
    }

    getDefense() {
        const defenseMap = {
            'uka': 20, 'oto': 25, 'oen': 15, 'ninja': 18
        };
        return defenseMap[this.type] || 15;
    }

    getRange() {
        const rangeMap = {
            'uka': 3, 'oto': 1, 'oen': 2, 'ninja': 2
        };
        return rangeMap[this.type] || 1;
    }

    getMovement() {
        const movementMap = {
            'uka': 3, 'oto': 4, 'oen': 3, 'ninja': 4
        };
        return movementMap[this.type] || 3;
    }

    getDisplayName() {
        const nameMap = {
            'uka': 'ウカ', 'oto': 'オト', 'oen': 'オエン', 'ninja': 'ニンジャ'
        };
        return nameMap[this.type] || this.name;
    }

    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.defense);
        this.hp = Math.max(0, this.hp - actualDamage);
        return actualDamage;
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    useSkill() {
        if (this.mp < 10) return false;

        this.mp -= 10;

        switch (this.type) {
            case 'uka':
                return this.areaAttackSkill();
            case 'oto':
                return this.pushBackSkill();
            case 'oen':
                return this.healSkill();
            default:
                return false;
        }
    }

    healSkill() {
        this.heal(40);
        return true;
    }

    pushBackSkill() {
        const enemies = gameState.enemies.filter(enemy => {
            const distance = Math.abs(enemy.x - this.x) + Math.abs(enemy.y - this.y);
            return distance <= 2;
        });

        enemies.forEach(enemy => {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            let newX = enemy.x;
            let newY = enemy.y;

            if (dx !== 0) newX += dx > 0 ? 1 : -1;
            if (dy !== 0) newY += dy > 0 ? 1 : -1;

            if (newX >= 0 && newX < 8 && newY >= 0 && newY < 6 && !gameState.board[newY][newX]) {
                gameState.board[enemy.y][enemy.x] = null;
                enemy.x = newX;
                enemy.y = newY;
                gameState.board[newY][newX] = enemy;
            }
        });
        return true;
    }

    areaAttackSkill() {
        let totalDamage = 0;
        gameState.enemies.forEach(enemy => {
            if (enemy.hp > 0) {
                const damage = (this.attack + this.attackBoost) + Math.floor(Math.random() * 15);
                const actualDamage = enemy.takeDamage(damage);
                totalDamage += actualDamage;
                showDamageNumber(enemy.x, enemy.y, actualDamage);

                if (enemy.hp <= 0) {
                    gameState.board[enemy.y][enemy.x] = null;
                    const enemyIndex = gameState.enemies.indexOf(enemy);
                    if (enemyIndex > -1) {
                        gameState.enemies.splice(enemyIndex, 1);
                    }
                }
            }
        });
        return totalDamage > 0;
    }
}

// 初期キャラクター配置
const PLAYER_CHARACTERS = [
    { name: 'ウカ', type: 'uka', x: 1, y: 4 },
    { name: 'オト', type: 'oto', x: 1, y: 2 },
    { name: 'オエン', type: 'oen', x: 1, y: 1 }
];


// 敵の初期配置 (最大12体まで)
const ENEMY_POSITIONS = [
    { x: 6, y: 4 },
    { x: 6, y: 2 },
    { x: 6, y: 1 },
    { x: 7, y: 3 },
    { x: 7, y: 5 },
    { x: 5, y: 3 },
    { x: 5, y: 1 },
    { x: 5, y: 5 },
    { x: 7, y: 1 },
    { x: 5, y: 4 },
    { x: 4, y: 2 },
    { x: 4, y: 4 }
];

// ステージごとの敵配置を生成
const STAGE_ENEMIES = {};
for (let stage = 1; stage <= 10; stage++) {
    const enemies = [];
    for (let i = 0; i < stage + 2; i++) {
        const pos = ENEMY_POSITIONS[i % ENEMY_POSITIONS.length];
        enemies.push({
            name: `ニンジャ${i + 1}`,
            type: 'ninja',
            x: pos.x,
            y: pos.y,
            isEnemy: true
        });
    }
    STAGE_ENEMIES[stage] = enemies;
}


const ENEMY_CHARACTERS = [
    { name: 'ニンジャ1', type: 'ninja', x: 6, y: 4, isEnemy: true },
    { name: 'ニンジャ2', type: 'ninja', x: 6, y: 2, isEnemy: true },
    { name: 'ニンジャ3', type: 'ninja', x: 6, y: 1, isEnemy: true }
];


