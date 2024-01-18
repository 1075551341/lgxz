/*
 * @Date: 2024-01-08 16:07:25
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-17 15:48:45
 * @Description: 路由
 */
const routes = [
  {
    path: '/',
    redirect: 'home'
  },
  {
    path: '/home', //主页
    name: 'home',
    redirect: '/home/homePageCommonRule',
    component: () => import('../views/homeView.vue'),
    children: [
      {
        path: 'test', //测试
        name: 'test',
        component: () => import('../views/testView.vue')
      },
      {
        path: 'homePageCommonRule', //首页(常规)
        name: 'homePageCommonRule',
        component: () => import('../views/homePageCommonRule.vue')
      },
      {
        path: 'homePageNewEnergy', //首页(新能源)
        name: 'homePageNewEnergy',
        component: () => import('../views/homePageNewEnergy.vue')
      },
      {
        path: 'realTimeAlarm', //实时告警
        name: 'realTimeAlarm',
        component: () => import('../views/realTimeAlarm.vue')
      },
      /*AGC考核与补偿*/
      {
        path: 'agcAvailableRateExam', //可用率考核与补偿
        name: 'agcAvailableRateExam',
        component: () => import('../views/agcAvailableRateExam.vue')
      },
      {
        path: 'agcInputExitTimesExam', //投退频次考核(常规)
        name: 'agcInputExitTimesExam',
        component: () => import('../views/agcInputExitTimesExam.vue')
      },
      {
        path: 'agcGxdlPassPercentExamNewEnergy', //贡献电量合格率考核(新能源)
        name: 'agcGxdlPassPercentExamNewEnergy',
        component: () => import('../views/agcGxdlPassPercentExamNewEnergy.vue')
      },
      {
        path: 'agcResponseTimeExamNewEnergy', //响应时间考核(新能源)
        name: 'agcResponseTimeExamNewEnergy',
        component: () => import('../views/agcResponseTimeExamNewEnergy.vue')
      },
      {
        path: 'agcResponseTimeExamCommonRule', //响应时间考核(常规)
        name: 'agcResponseTimeExamCommonRule',
        component: () => import('../views/agcResponseTimeExamCommonRule.vue')
      },

      {
        path: 'agcAdjustRateExamCommonRule', //调节速率考核(常规)
        name: 'agcAdjustRateExamCommonRule',
        component: () => import('../views/agcAdjustRateExamCommonRule.vue')
      },
      {
        path: 'agcGxdlPowerPowerRateCompensation', //贡献电量合格率补偿
        name: 'agcGxdlPowerPowerRateCompensation',
        component: () => import('../views/agcGxdlPowerPowerRateCompensation.vue')
      },
      {
        path: 'agcRawData', //AGC原始数据
        name: 'agcRawData',
        component: () => import('../views/agcRawData.vue')
      },
      {
        path: 'dailyPowerExam', //日发电计划考核
        name: 'dailyPowerExam',
        component: () => import('../views/dailyPowerExam.vue')
      },

      /*有偿调峰与顶峰能力*/
      {
        path: 'peakCompetencyExam', //顶峰能力考核
        name: 'peakCompetencyExam',
        component: () => import('../views/peakCompetencyExam.vue')
      },
      {
        path: 'blockedPowerAssessment', //受阻电力考核
        name: 'blockedPowerAssessment',
        component: () => import('../views/blockedPowerAssessment.vue')
      },
      {
        path: 'compensationPaidPeakTrimmingService', //有偿调峰服务补偿
        name: 'compensationPaidPeakTrimmingService',
        component: () => import('../views/compensationPaidPeakTrimmingService.vue')
      },
      /*功率预测考核*/
      {
        path: 'shortPowerPrediction', //短期功率预测
        name: 'shortPowerPrediction',
        component: () => import('../views/shortPowerPrediction.vue')
      },
      {
        path: 'superShortPowerPrediction', //超短期功率预测
        name: 'superShortPowerPrediction',
        component: () => import('../views/superShortPowerPrediction.vue')
      },
      {
        path: 'availablePowerDeviation', //可用功率偏差
        name: 'availablePowerDeviation',
        component: () => import('../views/availablePowerDeviation.vue')
      },
      {
        path: 'powerPredictionRawData', //功率预测原始数据
        name: 'powerPredictionRawData',
        component: () => import('../views/powerPredictionRawData.vue')
      },
      /*一次调频考核与补偿*/
      {
        path: 'oneFmCheck', //一次调频考核
        name: 'oneFmCheck',
        component: () => import('../views/oneFmCheckView.vue')
      },
      {
        path: 'oneFmBigFrequencyCheck', //大频差扰动考核
        name: 'oneFmBigFrequencyCheck',
        component: () => import('../views/oneFmBigFrequencyCheck.vue')
      },
      {
        path: 'oneFmContributionPowerCompensation', //贡献电量补偿
        name: 'oneFmContributionPowerCompensation',
        component: () => import('../views/oneFmContributionPowerCompensation.vue')
      },
      {
        path: 'oneFmRawData', //一次调频原始数据
        name: 'oneFmRawData',
        component: () => import('../views/oneFmRawData.vue')
      },
      /*AVC考核与补偿*/
      {
        path: 'avcInputExitRateExam', //投运率考核
        name: 'avcInputExitRateExam',
        component: () => import('../views/avcInputExitRateExam.vue')
      },
      {
        path: 'avcPassPercentExam', //投运率考核
        name: 'avcPassPercentExam',
        component: () => import('../views/avcPassPercentExam.vue')
      },
      {
        path: 'avcCompensation', //avc补偿
        name: 'avcCompensation',
        component: () => import('../views/avcCompensation.vue')
      },
      {
        path: 'avcRawData', //avc原始数据
        name: 'avcRawData',
        component: () => import('../views/avcRawData.vue')
      },
      /*有偿无功补偿*/
      {
        path: 'compensationIdleWork', //有偿无功补偿
        name: 'compensationIdleWork',
        component: () => import('../views/compensationIdleWork.vue')
      },
      {
        path: 'idleWorkRawData', //无功原始数据
        name: 'idleWorkRawData',
        component: () => import('../views/idleWorkRawData.vue')
      },
      {
        path: 'monthlyGeneralStatic', //月度综合统计
        name: 'monthlyGeneralStatic',
        component: () => import('../views/monthlyGeneralStatic.vue')
      },
      {
        path: 'sumAnalysis', //总结分析
        name: 'sumAnalysis',
        component: () => import('../views/sumAnalysis.vue')
      },
      {
        path: 'handCalculation', //手动计算
        name: 'handCalculation',
        component: () => import('../views/handCalculation.vue')
      }
    ]
  },

  {
    path: '/login', //登录
    name: 'login',
    component: () => import('../views/loginView.vue')
  },
  {
    path: '/404',
    name: '404',
    component: () => import('../components/404View.vue')
  },
  {
    path: '/:pathMatch(.*)',
    redirect: '/404'
  }
]
export default routes
