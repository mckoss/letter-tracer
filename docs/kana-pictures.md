# Kana pictures still to draw

The hiragana and katakana modes reuse the existing word pictures wherever one
fits (32 of them: ambulance, apple, bus, car, cat, dog, dump truck, engine, firetruck, fish, goat, helicopter, hotdog, kayak, leaf, limo, moon, motorcycle, orange, penguin, plane, rainbow, rocket, sun, tree, truck, umbrella, unicycle, whale, yacht, yoyo, zebra). Every other kana word
shows its word and romaji with no picture until it is drawn here.

Draw each one in `src/lib/art/subjects.ts` under the name in the first column
-- that is the name `src/lib/kana-words.json` already asks for -- and then take
its row off this list. `src/lib/kana.test.ts` fails if a picture the kana need
is missing from this list, or if one that has been drawn is still on it.

82 to draw:

| Picture        | Word                                      |
| -------------- | ----------------------------------------- |
| apron          | エプロン (epuron)                         |
| ball           | ボール (bōru)                             |
| balloon        | ふうせん (fūsen)                          |
| banana         | バナナ (banana)                           |
| beans          | まめ (mame)                               |
| bird           | ことり (kotori)                           |
| boat           | ふね (fune) — vehicles                    |
| book           | ほん (hon)                                |
| bug            | むし (mushi)                              |
| bulldozer      | ブルドーザー (burudōzā) — vehicles        |
| butterfly      | ちょうちょ (chōcho)                       |
| cable car      | ケーブルカー (kēburukā) — vehicles        |
| cake           | ケーキ (kēki)                             |
| camera         | カメラ (kamera)                           |
| camper         | キャンピングカー (kyanpingukā) — vehicles |
| candle         | ろうそく (rōsoku)                         |
| carrot         | ニンジン (ninjin)                         |
| caterpillar    | けむし (kemushi)                          |
| cement mixer   | ミキサーしゃ (mikisāsha) — vehicles       |
| cheese         | チーズ (chīzu)                            |
| chick          | ひよこ (hiyoko)                           |
| christmas tree | ツリー (tsurī)                            |
| cicada         | せみ (semi)                               |
| clock          | とけい (tokei)                            |
| clothes        | ようふく (yōfuku)                         |
| cookie         | クッキー (kukkī)                          |
| crane truck    | クレーンしゃ (kurēnsha) — vehicles        |
| crocodile      | わに (wani), ワニ (wani)                  |
| deer           | しか (shika)                              |
| digger         | ショベルカー (shoberukā) — vehicles       |
| dolphin        | イルカ (iruka)                            |
| duck           | あひる (ahiru)                            |
| eggplant       | なす (nasu)                               |
| electric train | でんしゃ (densha) — vehicles              |
| ferry          | フェリー (ferī) — vehicles                |
| fork           | フォーク (fōku)                           |
| giraffe        | キリン (kirin)                            |
| glasses        | めがね (megane)                           |
| ham            | ハム (hamu)                               |
| hamburger      | ハンバーガー (hanbāgā)                    |
| hand           | て (te)                                   |
| helmet         | ヘルメット (herumetto)                    |
| ice cream      | アイス (aisu)                             |
| koala          | コアラ (koara)                            |
| lemon          | れもん (remon), レモン (remon)            |
| lion           | ライオン (raion)                          |
| melon          | メロン (meron)                            |
| microphone     | マイク (maiku)                            |
| milk           | ミルク (miruku)                           |
| mole           | モグラ (mogura)                           |
| monorail       | モノレール (monorēru) — vehicles          |
| necktie        | ネクタイ (nekutai)                        |
| noodles        | ヌードル (nūdoru)                         |
| notebook       | ノート (nōto)                             |
| octopus        | タコ (tako)                               |
| peach          | もも (momo)                               |
| pencil         | えんぴつ (enpitsu)                        |
| rabbit         | うさぎ (usagi)                            |
| race car       | レーシングカー (rēshingukā) — vehicles    |
| ribbon         | リボン (ribon)                            |
| rice ball      | おにぎり (onigiri)                        |
| robot          | ロボット (robotto)                        |
| sandwich       | サンドイッチ (sandoitchi)                 |
| sausage        | ソーセージ (sōsēji)                       |
| seaweed        | のり (nori)                               |
| sled           | そり (sori)                               |
| snake          | へび (hebi)                               |
| snowman        | ゆきだるま (yukidaruma)                   |
| spoon          | スプーン (supūn)                          |
| star           | ほし (hoshi)                              |
| submarine      | せんすいかん (sensuikan) — vehicles       |
| subway         | ちかてつ (chikatetsu) — vehicles          |
| sunflower      | ヒマワリ (himawari)                       |
| sweater        | セーター (sētā)                           |
| taxi           | タクシー (takushī) — vehicles             |
| teddy bear     | ぬいぐるみ (nuigurumi)                    |
| television     | テレビ (terebi)                           |
| tomato         | トマト (tomato)                           |
| trumpet        | らっぱ (rappa)                            |
| ukulele        | ウクレレ (ukurere)                        |
| unicorn        | ユニコーン (yunikōn)                      |
| watermelon     | すいか (suika)                            |
