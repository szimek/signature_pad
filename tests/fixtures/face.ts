import type { PointGroup } from '../../src/signature_pad';

export const face: PointGroup[] = [
  {
    penColor: 'black',
    dotSize: 0,
    minWidth: 0.5,
    maxWidth: 2.5,
    points: [
      {
        time: 1523730547109,
        x: 125,
        y: 54,
        pressure: 0,
      },
    ],
  },
  {
    penColor: 'black',
    dotSize: 0,
    minWidth: 0.5,
    maxWidth: 2.5,
    points: [
      {
        time: 1523730547775,
        x: 175,
        y: 54,
        pressure: 0,
      },
    ],
  },
  {
    penColor: 'black',
    dotSize: 0,
    minWidth: 0.5,
    maxWidth: 2.5,
    points: [
      {
        time: 1523730548448,
        x: 83,
        y: 57,
        pressure: 0,
      },
      {
        time: 1523730548657,
        x: 85,
        y: 63,
        pressure: 0,
      },
      {
        time: 1523730548690,
        x: 94,
        y: 72,
        pressure: 0,
      },
      {
        time: 1523730548706,
        x: 105,
        y: 79,
        pressure: 0,
      },
      {
        time: 1523730548722,
        x: 113,
        y: 84,
        pressure: 0,
      },
      {
        time: 1523730548739,
        x: 126,
        y: 88,
        pressure: 0,
      },
      {
        time: 1523730548757,
        x: 139,
        y: 92,
        pressure: 0,
      },
      {
        time: 1523730548774,
        x: 151,
        y: 94,
        pressure: 0,
      },
      {
        time: 1523730548791,
        x: 162,
        y: 94,
        pressure: 0,
      },
      {
        time: 1523730548807,
        x: 176,
        y: 91,
        pressure: 0,
      },
      {
        time: 1523730548824,
        x: 186,
        y: 89,
        pressure: 0,
      },
      {
        time: 1523730548840,
        x: 199,
        y: 85,
        pressure: 0,
      },
      {
        time: 1523730548856,
        x: 209,
        y: 81,
        pressure: 0,
      },
      {
        time: 1523730548873,
        x: 221,
        y: 73,
        pressure: 0,
      },
      {
        time: 1523730548890,
        x: 227,
        y: 67,
        pressure: 0,
      },
      {
        time: 1523730548924,
        x: 234,
        y: 59,
        pressure: 0,
      },
    ],
  },
];

export const iso = {
  '?xml': {
    '@version': '1.0',
    '@encoding': 'utf-8',
  },
  SignatureSignTimeSeries: {
    '@xmlns': 'http://standards.iso.org/iso-iec/19794/-7/ed-1/amd/1',
    '@xmlns:cmn': 'http://standards.iso.org/iso-iec/19794/-1/ed-2/amd/2',
    '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    '@xsi:schemaLocation':
      'https://standards.iso.org/iso-iec/19794/-7/ed-2/amd/1/19794-7_ed2_amd1.xsd',
    '@cmn:SchemaVersion': '1.0',
    Version: {
      'cmn:Major': 2,
      'cmn:Minor': 0,
    },
    RepresentationList: {
      Representation: {
        CaptureDateAndTime: '2018-04-14T18:29:07.109Z',
        CaptureDevice: {
          DeviceID: {
            'cmn:Organization': 259,
            'cmn:Identifier': 1,
          },
          DeviceTechnology: 'Electromagnetic',
        },
        QualityList: {
          'cmn:Quality': {
            'cmn:Algorithm': {
              'cmn:Organization': 259,
              'cmn:Identifier': 1,
            },
            'cmn:QualityCalculationFailed': null,
          },
        },
        InclusionField: '6CC0',
        ChannelDescriptionList: {
          DTChannelDescription: {
            ScalingValue: 1000,
          },
        },
        SamplePointList: {
          SamplePoint: [
            {
              PenTipCoord: {
                'cmn:X': 0,
                'cmn:Y': 0,
                'cmn:Z': 0,
              },
              PenTipVelocity: {
                VelocityX: 0,
                VelocityY: 0,
              },
              DTChannel: 0,
              FChannel: 0,
            },
            {
              PenTipCoord: {
                'cmn:X': 13,
                'cmn:Y': 0,
                'cmn:Z': 0,
              },
              PenTipVelocity: {
                VelocityX: 20,
                VelocityY: 0,
              },
              DTChannel: 666,
              FChannel: 0,
            },
            {
              PenTipCoord: {
                'cmn:X': -11,
                'cmn:Y': -1,
                'cmn:Z': 0,
              },
              PenTipVelocity: {
                VelocityX: -36,
                VelocityY: -1,
              },
              DTChannel: 673,
              FChannel: 0,
            },
            {
              PenTipCoord: {
                'cmn:X': -11,
                'cmn:Y': -2,
                'cmn:Z': 0,
              },
              PenTipVelocity: {
                VelocityX: 0,
                VelocityY: -5,
              },
              DTChannel: 209,
              FChannel: 0,
            },
            {
              PenTipCoord: {
                'cmn:X': -8,
                'cmn:Y': -5,
                'cmn:Z': 0,
              },
              PenTipVelocity: {
                VelocityX: 91,
                VelocityY: -91,
              },
              DTChannel: 33,
              FChannel: 0,
            },
            {
              PenTipCoord: {
                'cmn:X': -5,
                'cmn:Y': -7,
                'cmn:Z': 0,
              },
              PenTipVelocity: {
                VelocityX: 188,
                VelocityY: -125,
              },
              DTChannel: 16,
              FChannel: 0,
            },
            {
              PenTipCoord: {
                'cmn:X': -3,
                'cmn:Y': -8,
                'cmn:Z': 0,
              },
              PenTipVelocity: {
                VelocityX: 125,
                VelocityY: -62,
              },
              DTChannel: 16,
              FChannel: 0,
            },
            {
              PenTipCoord: {
                'cmn:X': 0,
                'cmn:Y': -9,
                'cmn:Z': 0,
              },
              PenTipVelocity: {
                VelocityX: 176,
                VelocityY: -59,
              },
              DTChannel: 17,
              FChannel: 0,
            },
            {
              PenTipCoord: {
                'cmn:X': 4,
                'cmn:Y': -10,
                'cmn:Z': 0,
              },
              PenTipVelocity: {
                VelocityX: 222,
                VelocityY: -56,
              },
              DTChannel: 18,
              FChannel: 0,
            },
            {
              PenTipCoord: {
                'cmn:X': 7,
                'cmn:Y': -11,
                'cmn:Z': 0,
              },
              PenTipVelocity: {
                VelocityX: 176,
                VelocityY: -59,
              },
              DTChannel: 17,
              FChannel: 0,
            },
            {
              PenTipCoord: {
                'cmn:X': 10,
                'cmn:Y': -11,
                'cmn:Z': 0,
              },
              PenTipVelocity: {
                VelocityX: 176,
                VelocityY: 0,
              },
              DTChannel: 17,
              FChannel: 0,
            },
            {
              PenTipCoord: {
                'cmn:X': 13,
                'cmn:Y': -10,
                'cmn:Z': 0,
              },
              PenTipVelocity: {
                VelocityX: 188,
                VelocityY: 63,
              },
              DTChannel: 16,
              FChannel: 0,
            },
            {
              PenTipCoord: {
                'cmn:X': 16,
                'cmn:Y': -9,
                'cmn:Z': 0,
              },
              PenTipVelocity: {
                VelocityX: 176,
                VelocityY: 59,
              },
              DTChannel: 17,
              FChannel: 0,
            },
            {
              PenTipCoord: {
                'cmn:X': 20,
                'cmn:Y': -8,
                'cmn:Z': 0,
              },
              PenTipVelocity: {
                VelocityX: 250,
                VelocityY: 63,
              },
              DTChannel: 16,
              FChannel: 0,
            },
            {
              PenTipCoord: {
                'cmn:X': 22,
                'cmn:Y': -7,
                'cmn:Z': 0,
              },
              PenTipVelocity: {
                VelocityX: 125,
                VelocityY: 63,
              },
              DTChannel: 16,
              FChannel: 0,
            },
            {
              PenTipCoord: {
                'cmn:X': 25,
                'cmn:Y': -5,
                'cmn:Z': 0,
              },
              PenTipVelocity: {
                VelocityX: 176,
                VelocityY: 118,
              },
              DTChannel: 17,
              FChannel: 0,
            },
            {
              PenTipCoord: {
                'cmn:X': 27,
                'cmn:Y': -3,
                'cmn:Z': 0,
              },
              PenTipVelocity: {
                VelocityX: 118,
                VelocityY: 118,
              },
              DTChannel: 17,
              FChannel: 0,
            },
            {
              PenTipCoord: {
                'cmn:X': 29,
                'cmn:Y': -1,
                'cmn:Z': 0,
              },
              PenTipVelocity: {
                VelocityX: 59,
                VelocityY: 59,
              },
              DTChannel: 34,
              FChannel: 0,
            },
          ],
        },
      },
    },
    VendorSpecificData: {
      'cmn:TypeCode': 0,
      'cmn:Data': null,
    },
  },
};
