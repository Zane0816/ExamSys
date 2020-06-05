import React from 'react'
import { hot } from 'react-hot-loader/root'
import { observer } from 'mobx-react'
import AppStore from '../store/AppStore'
import { Button, Icon, List } from 'antd'
import classNames from 'classnames'
import { Answer, GetRightValue } from '../../main/Common'

type ExamAnswerProps = {
  ReReview(): void
} & Partial<ExamAnswerDefaultProps>

type ExamAnswerDefaultProps = {}

@hot
@observer
class ExamAnswer extends React.Component<ExamAnswerProps> {
  constructor(props: Readonly<ExamAnswerProps>) {
    super(props)
  }

  render() {
    return (
      <>
        {AppStore.ExamAnswer && (
          <List
            id="ExamAnswer"
            header={
              <>
                <p>
                  <b>{AppStore.ExamAnswer.ExamName}</b> 总分：{AppStore.ExamAnswer.TotalScore}{' '}
                  <span>
                    {AppStore.ExamAnswer.UserName}--{AppStore.ExamAnswer.UserNum}{' '}
                  </span>
                  <label>得分：{AppStore.ExamAnswer.Score}</label>
                </p>
                <p>案例描述:{AppStore.ExamAnswer.ExamDesc}</p>
              </>
            }>
            {AppStore.ExamAnswer.TestQuestions.map((d, i) => {
              return (
                <List.Item key={i}>
                  <p>
                    题目{i + 1}：{d.Title}
                  </p>
                  {d.Desc && <p>问题描述：{d.Desc}</p>}
                  {'Answers' in d ? (
                    d.Answers.map((da, ai) => {
                      const IsSelected = AppStore.ExamAnswer!.Answers.length > i && AppStore.ExamAnswer!.Answers[i].includes(Answer[ai])
                      return (
                        <p key={ai} className={classNames('Answer', { Right: da.Checked, Error: IsSelected && !da.Checked })}>
                          {Answer[ai]}：{da.Title}
                          {IsSelected && <Icon type="check" />}
                        </p>
                      )
                    })
                  ) : (
                    <p className="Answer">{d.Answer}</p>
                  )}
                  {'Answers' in d && (AppStore.ExamAnswer!.Answers.length > i && AppStore.ExamAnswer!.Answers[i].slice().sort().join()) !== GetRightValue(d.Answers).join() && (
                    <p className="ErrorTip">
                      回答错误！<label>（正确答案：{GetRightValue(d.Answers).join('，')}）</label>
                    </p>
                  )}
                </List.Item>
              )
            })}
          </List>
        )}
        <p>
          <Button
            onClick={() => {
              this.props.ReReview()
            }}
            style={{ width: '60%' }}>
            返回
          </Button>
        </p>
      </>
    )
  }
}

export default ExamAnswer
