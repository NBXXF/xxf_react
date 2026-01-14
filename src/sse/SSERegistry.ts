import {SSEManager} from './SSEManager';

type ManagerKey = string;

class SSERegistry {
    private managers = new Map<ManagerKey, SSEManager>();

    /**
     * 获取或创建 SSEManager
     */
    getOrCreate(
        key: ManagerKey,
        factory: () => SSEManager
    ): SSEManager {
        let manager = this.managers.get(key);

        if (!manager) {
            manager = factory();
            this.managers.set(key, manager);
        }

        return manager;
    }

    /**
     * 移除并断开某一个 manager
     */
    remove(key: ManagerKey) {
        const manager = this.managers.get(key);
        if (!manager) return;

        manager.disconnect();
        this.managers.delete(key);
    }

    /**
     * ⭐ 账号切换 / 登出时调用
     */
    clear() {
        for (const manager of this.managers.values()) {
            manager.disconnect();
        }
        this.managers.clear();
    }
}

export const sseRegistry = new SSERegistry();
