# 🎨 Professional Web Designer Agent

カスタムデザイナーエージェント - Claude Agent SDKで構築されたプロフェッショナルWebデザイン分析ツール

## セットアップ

### 1. API Keyの設定

`.env`ファイルを作成してAnthropic API Keyを設定：

```bash
cp .env.example .env
```

`.env`ファイルを編集：

```env
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
```

### 2. 実行

```bash
npx tsx designer-agent.ts
```

## 機能

このエージェントは以下の分析を自律的に実行します：

### 分析ツール

1. **audit_html_accessibility**
   - セマンティックHTML検証
   - ARIA属性チェック
   - 画像alt属性確認
   - 見出し階層分析
   - WCAG準拠チェック

2. **check_responsive_design**
   - ビューポート設定確認
   - メディアクエリ分析
   - フレキシブル単位使用状況
   - Flexbox/Grid使用チェック

3. **analyze_typography**
   - フォントファミリー分析
   - 行間・文字間隔チェック
   - プレミアム美学評価
   - フルイッドタイポグラフィ提案

4. **performance_recommendations**
   - 外部リソース最適化
   - 画像遅延読み込み提案
   - CSS/JS バンドル分析
   - クリティカルCSS提案

## エージェントの動作

1. `index.html`を読み込み
2. 全分析ツールを実行
3. スコアリング（100点満点）：
   - Accessibility Score
   - Responsive Score
   - Typography Score
   - Performance Score
4. 具体的な改善提案を生成
5. 優先順位付きアクションプランを提示

## 出力例

```
🎨 Professional Web Designer Agent Starting...

[Tool Call: read_file]
Input: { "file_path": "/c/Users/owner/20251230_02/index.html" }

[Tool Call: audit_html_accessibility]
Accessibility Score: 85/100
Issues:
- Missing ARIA landmarks for navigation
- Color contrast verification needed

[Tool Call: analyze_typography]
Typography Score: 90/100
Premium features detected:
- Serif fonts for elegance
- Letter spacing optimization

Recommendations:
1. Add ARIA role="navigation" to header
2. Implement fluid typography with clamp()
3. Optimize image loading with lazy loading
...
```

## カスタマイズ

`designer-agent.ts`のsystemPromptを編集してエージェントの専門性を調整可能：

```typescript
const systemPrompt = `You are a world-class web designer...`;
```

## トラブルシューティング

### Error: Could not resolve authentication method

`.env`ファイルが正しく設定されているか確認：

```bash
cat .env
# ANTHROPIC_API_KEY=sk-ant-... が表示されるべき
```

### Module not found errors

依存関係を再インストール：

```bash
npm install
```

## 技術スタック

- **Claude Sonnet 4.5**: 最新のAIモデル
- **Anthropic SDK**: Messages API + Tool Use
- **TypeScript**: 型安全な実装
- **Custom Tools**: 5つの専用分析ツール

---

🌸 **Miyabi Framework** との統合 - 自律型デザイン品質保証システム
