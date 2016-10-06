const values = [
    {
        "userEnteredValue":
        {
            "stringValue": "제목"
        },
    },
    {
        "userEnteredValue":
        {
            "stringValue": "화면아이디"
        },
    },
    {
        "userEnteredValue":
        {
            "stringValue": "화면명"
        },
    },
    {
        "userEnteredValue":
        {
            "stringValue": "작성자"
        },
    },
    {
        "userEnteredValue":
        {
            "stringValue": "연락처"
        },
    },
    {
        "userEnteredValue":
        {
            "stringValue": "등록일시"
        },
    },
     {
        "userEnteredValue":
        {
            "stringValue": "이미지"
        },
    },
    {
        "userEnteredValue":
        {
            "stringValue": "os종류"
        },
    },
    {
        "userEnteredValue":
        {
            "stringValue": "os버전"
        },
    },
    {
        "userEnteredValue":
        {
            "stringValue": "디바이스명"
        },
    },
    {
        "userEnteredValue":
        {
            "stringValue": "디바이스정보"
        },
    },
    {
        "userEnteredValue":
        {
            "stringValue": "상태"
        },
    },
    {
        "userEnteredValue":
        {
            "stringValue": "담당자"
        },
    },
]


const data = [
    {
        "rowData":
        [
            {
                values

            }
        ]
    }
]

const SHEET_OPTIONS = {
    resource: {
        "properties":
        {
            "title": "issue_management"
        },
        "sheets":
        [
            {
                "properties":
                {
                    "sheetId": 1,
                    "title": "issue",
                },
                data
            }
        ]
    }
}


const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
];

const CONF_BASE = __dirname + '/.conf'
const OAUTH_OTKEN_PATH = CONF_BASE + '/sheets.googleapis.com-nodejs-quickstart.json'
const CLIENT_SECRET = CONF_BASE + '/client_secret.json'
const SHEET_FILEINFO = CONF_BASE + '/sheetFileInfo.json'


module.exports = {
    SHEET_OPTIONS,
    SCOPES,
    OAUTH_OTKEN_PATH,
    CLIENT_SECRET,
    SHEET_FILEINFO
}