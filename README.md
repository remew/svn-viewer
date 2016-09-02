# svn-viewer
SubversionのstatusとかdiffをGUIで見たりする便利ツール。自分用。

## つかいかた
1. `git clone https://github.com/remew/svn-viewer`
1. `cd svn-viewer`
1. `npm install`
1. `npm start`
1. それっぽいテキストフォームにSubversionの管理ディレクトリ？ルートディレクトリ？のパスを入れてそれっぽいボタンを押すと、コマンドラインから`svn status`をしたのと同じ
1. statusが表示されたらリンクをクリックすると右側にdiffがそのまま表示されたり
1. リンクの左のチェックボックスをクリックするとcommit用のコマンドが下に表示されるのでコピペができて嬉しい（自分にとっては嬉しい）
