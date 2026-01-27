import {useMediaQuery} from 'react-responsive'

///可用于判断手机端和电脑端的分界线
export const useIsBelowMd = () => {
    return useMediaQuery({maxWidth: 767})
}