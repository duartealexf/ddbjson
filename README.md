# 💫 Convert JSON from / to DynamoDB JSON on CLI! 🙌

Use `ddbjson` to convert from DynamoDB JSON format to regular JSON and vice versa on any terminal:

- 📄 Pass in a file path to output the converted string!
- ✏️ Pass in a JSON string to be converted!
- ⛓ Pipe in JSON from another command to read from stdin!
- 🍰 Read and convert only a subset of the JSON!
- 🤝 The output can be piped or redirected to other commands!
- 🧰 Integrate it into your workflow, when using AWS DynamoDB CLI!

<br />

> 💡 [See usage below](#-usage)! 👇

<br />

# 🔩 Installation

```sh
yarn global add ddbjson
```

```sh
npm i -g ddbjson
```
<br />

## 🎳 Requirements

- NodeJS 12+

<br />

# 🔑 Usage

```sh
ddbjson <command> [options] <json>

Commands:
  ddbjson unmarshall, u    Converts a DynamoDB JSON format to regular JSON
  ddbjson marshall, m      Converts a regular JSON to a DynamoDB JSON format

Options:
  -g <path>                Parse only a subset of given JSON by passing the path to a property
```

## Usage examples

- [🔶 Unmarshall: convert from DynamoDB JSON to regular JSON](#-unmarshall-convert-from-dynamodb-json-to-regular-json)
  - [🔸 Unmarshall from a JSON file](#-unmarshall-from-a-json-file)
  - [🔸 Unmarshall from a JSON string](#-unmarshall-from-a-json-string)
  - [🔸 Unmarshall from stdin](#-unmarshall-from-stdin)
- [🔷 Marshall: convert from regular JSON to DynamoDB JSON](#-marshall-convert-from-regular-json-to-dynamodb-json)
  - [🔹 Marshall from a JSON file](#-marshall-from-a-json-file)
  - [🔹 Marshall from a JSON string](#-marshall-from-a-json-string)
  - [🔹 Marshall from stdin](#-marshall-from-stdin)
- [🍰 Parse only a subset of JSON using `-g`](#-parse-only-a-subset-of-json-using--g)

## 🔶 Unmarshall: convert from DynamoDB JSON to regular JSON

⌨️ Command: `unmarshall` or `u`

### 🔸 Unmarshall from a JSON file

```json
# food.json
{
  "fruits": {
    "L": [
      { "S": "apple" },
      { "S": "kiwi" }
    ]
  }
}
```

```sh
# read from the file:
$ ddbjson u food.json

# {"fruits":["apple","kiwi"]}
```

### 🔸 Unmarshall from a JSON string

```sh
$ ddbjson u '{"fruits":{"L":[{"S":"apple"},{"S":"kiwi"}]}}'

# {"fruits":["apple","kiwi"]}
```

### 🔸 Unmarshall from stdin

- Pipe in JSON from other commands.
- Pipe in from AWS CLI DynamoDB commands (use `-g` argument – [understand why](#-when-reading-from-aws-cli-dynamodb-commands))
- See more [usage ideas below](#-more-usage-ideas)!

```sh
$ aws dynamodb get-item --table-name food --key '{"type":{"S":"fruit"}}' | ddbjson u -g "Item" -

# {"fruits":["apple","kiwi"]}
```

<br />

## 🔷 Marshall: convert from regular JSON to DynamoDB JSON

⌨️ Command: `marshall` or `m`

### 🔹 Marshall from a JSON file

```json
# food.json
{
  "fruits": [
    "apple",
    "kiwi"
  ]
}
```

```sh
# read from the file:
$ ddbjson m food.json

# {"fruits":{"L":[{"S":"apple"},{"S":"kiwi"}]}}
```

### 🔹 Marshall from a JSON string

```sh
$ ddbjson m '{"fruits":["apple","kiwi"]}'

# {"fruits":{"L":[{"S":"apple"},{"S":"kiwi"}]}}
```

### 🔹 Marshall from stdin

- Pipe in JSON from other commands.
- See more [usage ideas below](#-more-usage-ideas)!

```sh
$ curl https://food.com/api | ddbjson m -

# {"fruits":{"L":[{"S":"apple"},{"S":"kiwi"}]}}
```

<br />

## 🍰 Parse only a subset of JSON using `-g`

- Useful when reading from AWS CLI DynamoDB commands ([read more](#-when-reading-from-aws-cli-dynamodb-commands)).
- Pass in the full path to the JSON property.
- The given property must be an object or array.

```json
# food.json
{
  "fruits": [
    {
      "name": "apple",
      "color": "red",
      "benefits": ["fiber","vitamin b","vitamin e"]
    },
    {
      "name": "kiwi",
      "color": "green",
      "benefits": ["potassium","vitamin e","vitamin c"]
    }
  ]
}
```

```sh
$ ddbjson m -g "fruits.0.benefits" food.json

# [{"S":"fiber"},{"S":"vitamin b"},{"S":"vitamin e"}]
```


<br />

# ⚠️ When reading from AWS CLI DynamoDB commands

Given this `food` table:

| type  | foodItems                      |
| ----- | ------------------------------ |
| fruit | `[{"S":"apple"},{"S":"kiwi"}]` |

## ⚡️ aws dynamodb get-item

AWS CLI wraps the table output in the `Item` property:

```sh
$ aws dynamodb get-item --table-name food --key '{"type":{"S":"fruit"}}' 

# {
#   "Item": {
#     "foodItems": {
#       "L": [
#         {
#           "S": "apple"
#         },
#         ...
```

Use `-g "Item"` when unmarshalling output from `aws dynamodb get-item`:

```sh
$ aws dynamodb get-item --table-name food --key '{"type":{"S":"fruit"}}'  | ddbjson u -g "Item" -

# {"foodItems":["apple","kiwi"],"type":"fruit"}
```

## ⚡️ aws dynamodb scan

AWS CLI wraps the table output in the "Items" property:

```sh
$ aws dynamodb scan --table-name food

{
  "Items": [
    {
      "type": { "S": "fruit" },
      "foodItems": {
        "L": [
            { "S": "apple" },
            { "S": "kiwi" }
            ...
```

Use `-g "Items.0"` (or another index) when unmarshalling output from `aws dynamodb scan`. Unfortunately the output from AWS is not friendly so you can't unmarshall all items:

```sh
$ aws dynamodb scan --table-name food | ddbjson u -g "Items.0" -

# {"foodItems":["apple","kiwi"],"type":"fruit"}
```

# 💡 More usage ideas

## 🌷 Format output using jq

Use [jq](https://stedolan.github.io/jq/download/) to format the JSON output:

```sh
$ ddbjson u marshalled-food.json | jq

# {
#   "fruits": [
#     "apple",
#     "kiwi"
#   ]
# }
```

Redirect output to a file:

```sh
$ ddbjson u marshalled-food.json | jq > unmarshalled-food.json
$ cat unmarshalled-food.json

# {
#   "fruits": [
#     "apple",
#     "kiwi"
#   ]
# }
```

When combined with AWS CLI output this is really powerful:

```sh
$ aws dynamodb get-item --table-name food --key `ddbjson m '{"type":"fruit"}'` | ddbjson u -g 'Item' - | jq > result.json
$ cat result.json

# {
#   "foodItems": [
#     "apple",
#     "kiwi"
#   ],
#   "type": "fruit"
# }
```

## ⛓ Use as part of other commands

For example, marshall the Partition key in the AWS CLI command:

```sh
$ aws dynamodb get-item --table-name food --key `ddbjson m '{"type":"fruit"}'`
```

## 🎬 Use heredoc

Read from stdin when combined with heredocs:

```sh
$ cat << EOF | ddbjson m -               
{               
  "fruits": [
    "apple",
    "kiwi"
  ]
}
EOF

# {"fruits":{"L":[{"S":"apple"},{"S":"kiwi"}]}}
```

## ✏️ Convert regular JSON file when writing to DynamoDB

```json
# meat.json
{
  "type": "meat",
  "foodItems": [
    "beef",
    "pork"
  ]
}
```

Read from regular JSON file to write to DynamoDB:

```sh
$ aws dynamodb put-item --table-name food --item `ddbjson m meat.json`
```
